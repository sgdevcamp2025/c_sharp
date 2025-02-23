package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.dto.ChangeProfileResponseDto;
import com.jootalkpia.file_server.dto.UploadChunkRequestDto;
import com.jootalkpia.file_server.dto.UploadFileRequestDto;
import com.jootalkpia.file_server.dto.UploadFilesRequestDto;
import com.jootalkpia.file_server.dto.UploadFileResponseDto;
import com.jootalkpia.file_server.dto.UploadFilesResponseDto;
import com.jootalkpia.file_server.entity.Files;
import com.jootalkpia.file_server.entity.User;
import com.jootalkpia.file_server.exception.common.CustomException;
import com.jootalkpia.file_server.exception.common.ErrorCode;
import com.jootalkpia.file_server.repository.FileRepository;
import com.jootalkpia.file_server.repository.UserRepository;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.AbortMultipartUploadRequest;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CompletedMultipartUpload;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchUploadException;
import software.amazon.awssdk.services.s3.model.UploadPartRequest;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    private final S3AsyncClient s3AsyncClient;
    private final FileRepository fileRepository;
    private final FileTypeDetector fileTypeDetector;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    // 청크 업로드 상태 저장
    private static final ConcurrentHashMap<String, List<CompletedPart>> PART_TAG_STORAGE = new ConcurrentHashMap<>();
    // 업로드 ID 저장
    private static final ConcurrentHashMap<String, String> UPLOAD_ID_STORAGE = new ConcurrentHashMap<>();

    /**
     * 멀티파트 업로드 초기화
     */
    public String initiateMultipartUpload(String s3Key) {
        CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        try {
            CompletableFuture<CreateMultipartUploadResponse> createResponse = s3AsyncClient.createMultipartUpload(createRequest);
            String uploadId = createResponse.join().uploadId();
            log.info("S3 멀티파트 업로드 초기화: {}, uploadId: {}", s3Key, uploadId);
            return uploadId;
        } catch (Exception e) {
            log.error("S3 멀티파트 업로드 초기화 실패: {}", s3Key, e);
            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), "S3 멀티파트 업로드 초기화 실패");
        }
    }

    /**
     * 청크 업로드 처리
     */
    public Object uploadFileChunk(UploadChunkRequestDto request) {
        MultipartFile chunkFile = request.getChunkInfo().getChunk();
        String tempFileIdentifier = request.getTempFileIdentifier();
        int totalChunks = request.getTotalChunks().intValue();
        int chunkIndex = request.getChunkInfo().getChunkIndex().intValue();

        log.info("uploadFileChunk request: {}", chunkIndex);

        // 첫 번째 청크에서만 Upload ID 생성
        String tempUploadId;
        synchronized (UPLOAD_ID_STORAGE) {
            tempUploadId = UPLOAD_ID_STORAGE.get(tempFileIdentifier);
            if (tempUploadId == null) {
                String fileType = request.getFileType();
                String s3Key = defineFolderToUpload(fileType) + "/" + tempFileIdentifier;
                tempUploadId = initiateMultipartUpload(s3Key);
                UPLOAD_ID_STORAGE.put(tempFileIdentifier, tempUploadId);
                log.info("첫 번째 청크 - Upload ID 생성 및 저장: {}", tempUploadId);
            }
        }

        String uploadId = tempUploadId;
        log.info("청크 업로드 중 - Upload ID: {}, Chunk Index: {}", uploadId, chunkIndex);

        try {
            CompletableFuture<CompletedPart> future = asyncUploadPartToS3(tempFileIdentifier, uploadId, chunkIndex, chunkFile.getBytes());

            future.thenAccept(completedPart -> {
                synchronized (PART_TAG_STORAGE) {
                    PART_TAG_STORAGE.computeIfAbsent(uploadId, k -> new ArrayList<>()).add(completedPart);
                }

                if (isLastChunk(totalChunks, uploadId)) {
                    synchronized (PART_TAG_STORAGE) {
                        String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(chunkFile);
                        Files filesEntity = new Files();
                        completeMultipartUpload(tempFileIdentifier, uploadId, PART_TAG_STORAGE.get(uploadId), filesEntity, fileType);
                        log.info("모든 청크 업로드 완료 및 상태 초기화: {}", uploadId);

                        // 상태 초기화
                        synchronized (UPLOAD_ID_STORAGE) {
                            UPLOAD_ID_STORAGE.remove(tempFileIdentifier);
                        }
                        synchronized (PART_TAG_STORAGE) {
                            PART_TAG_STORAGE.remove(uploadId);
                        }
                    }
                }
            });

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("status", "partial");
            return response;

        } catch (NoSuchUploadException e) {
            log.error("유효하지 않은 uploadId - 재시도 진행: {}", uploadId);
            UPLOAD_ID_STORAGE.remove(tempFileIdentifier);
            String fileType = request.getFileType();
            String s3Key = defineFolderToUpload(fileType) + "/" + tempFileIdentifier;
            String newUploadId = initiateMultipartUpload(s3Key);
            UPLOAD_ID_STORAGE.put(tempFileIdentifier, newUploadId);
            throw new CustomException(ErrorCode.CHUNK_PROCESSING_FAILED.getCode(), "유효하지 않은 업로드 ID로 인한 실패, 새 uploadId 생성");
        } catch (IOException e) {
            throw new CustomException(ErrorCode.CHUNK_PROCESSING_FAILED.getCode(), ErrorCode.CHUNK_PROCESSING_FAILED.getMsg());
        }
    }

    /**
     * S3에 비동기로 청크 업로드
     */
    public CompletableFuture<CompletedPart> asyncUploadPartToS3(String fileName, String uploadId, int partNumber, byte[] chunkData) {
        UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .uploadId(uploadId)
                .partNumber(partNumber)
                .build();

        return s3AsyncClient.uploadPart(uploadPartRequest, AsyncRequestBody.fromBytes(chunkData))
                .thenApply(uploadPartResponse -> {
                    CompletedPart completedPart = CompletedPart.builder()
                            .partNumber(partNumber)
                            .eTag(uploadPartResponse.eTag())
                            .build();
                    log.info("청크 업로드 완료 - 파트 번호: {}", partNumber);
                    return completedPart;
                }).exceptionally(ex -> {
                    log.error("청크 업로드 실패 - 파트 번호: {}, 이유: {}", partNumber, ex.getMessage(), ex);
                    throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), "청크 업로드 실패");
                });
    }

    /**
     * S3 멀티파트 업로드 병합 및 Files 엔티티 저장
     */
    public void completeMultipartUpload(String s3Key, String uploadId, List<CompletedPart> completedParts,
                                        Files filesEntity, String fileType) {

        CompletedMultipartUpload completedMultipartUpload = CompletedMultipartUpload.builder()
                .parts(completedParts)
                .build();

        CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .uploadId(uploadId)
                .multipartUpload(completedMultipartUpload)
                .build();

        s3AsyncClient.completeMultipartUpload(completeRequest)
                .thenAccept(completeMultipartUploadResponse -> {
                    log.info("S3 멀티파트 업로드 완료: {}", s3Key);

                    // 업로드 상태 초기화
                    synchronized (UPLOAD_ID_STORAGE) {
                        UPLOAD_ID_STORAGE.remove(s3Key);
                    }
                    synchronized (PART_TAG_STORAGE) {
                        PART_TAG_STORAGE.remove(uploadId);
                    }
                }).exceptionally(ex -> {
                    log.error("S3 멀티파트 업로드 병합 실패: {}", s3Key, ex);
                    throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), "S3 멀티파트 업로드 병합 실패");
                });
    }


    /**
     * S3에서 파일 크기 가져오기
     */
    private Long calculateFileSize(String s3Key) {
        HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        HeadObjectResponse headResponse = s3AsyncClient.headObject(headRequest).join();
        return headResponse.contentLength();
    }


    private boolean isLastChunk(int totalChunks, String uploadId) {
        // S3에 업로드된 CompletedPart 리스트 가져오기
        List<CompletedPart> completedParts = PART_TAG_STORAGE.get(uploadId);

        // 업로드된 청크 개수와 totalChunks 비교
        if (completedParts != null && completedParts.size() == totalChunks) {
            log.info("모든 청크가 S3에 업로드됨 - 업로드 ID: {}", uploadId);
            return true;
        }
        return false;
    }


    public String defineFolderToUpload(String fileType) {
        if ("VIDEO".equalsIgnoreCase(fileType)) {
            return "videos";
        } else if ("IMAGE".equalsIgnoreCase(fileType)) {
            return "images";
        } else if ("THUMBNAIL".equalsIgnoreCase(fileType)) {
            return "thumbnails";
        } else {
            log.error("정의되지 않은 파일 타입: {}", fileType);
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE.getCode(), "지원하지 않는 파일 타입");
        }
    }


//    // 청크 저장을 위한 Map (tempFileIdentifier 기준으로 리스트 저장)
//    private static final ConcurrentHashMap<String, List<File>> TEMP_FILE_STORAGE = new ConcurrentHashMap<>();
//
//    @Transactional
//    public Object uploadFileChunk(UploadChunkRequestDto request) {
//        MultipartFile chunkFile = request.getChunkInfo().getChunk();
//        String tempFileIdentifier = request.getTempFileIdentifier();
//        int totalChunks = request.getTotalChunks().intValue();
//        int chunkIndex = request.getChunkInfo().getChunkIndex().intValue();
//
//        log.info("Processing chunk {} of {}", chunkIndex, totalChunks);
//
//        try {
//            // 청크 저장 리스트 불러오고 없으면 생성
//            List<File> chunkList = TEMP_FILE_STORAGE.computeIfAbsent(tempFileIdentifier, k -> new ArrayList<>(totalChunks));
//
//            // 리스트 크기를 totalChunks 크기로 확장
//            while (chunkList.size() < totalChunks) {
//                chunkList.add(null);
//            }
//
//            int adjustedIndex = chunkIndex - 1;
//
//            File tempChunkFile = File.createTempFile("chunk_" + chunkIndex, ".part");
//            appendChunkToFile(tempChunkFile, chunkFile);
//            chunkList.set(adjustedIndex, tempChunkFile);
//
//            // 모든 청크가 수신 완료되었는지 확인 (전체 크기가 맞으면 병합)
//            if (chunkList.size() == totalChunks && chunkList.stream().allMatch(java.util.Objects::nonNull)) {
//                log.info("모든 청크가 도착함 - 병합 시작 (임시 파일 ID: {})", tempFileIdentifier);
//                return finalizeFileUpload(tempFileIdentifier, chunkList);
//            }
//        } catch (IOException e) {
//            throw new CustomException(ErrorCode.CHUNK_PROCESSING_FAILED.getCode(), ErrorCode.CHUNK_PROCESSING_FAILED.getMsg());
//        }
//
//        // 병합이 완료되지 않은 경우 기본 응답 반환
//        Map<String, Object> response = new HashMap<>();
//        response.put("code", 200);
//        response.put("status", "partial");
//        return response;
//    }
//
//    private UploadFileResponseDto finalizeFileUpload(String tempFileIdentifier, List<File> chunkList) {
//        try {
//            File mergedFile = mergeChunks(chunkList, tempFileIdentifier);
//
//            Files filesEntity = new Files();
//            fileRepository.save(filesEntity);
//            Long fileId = filesEntity.getFileId();
//
//            // S3 업로드
//            String fileType = fileTypeDetector.detectFileTypeFromFile(mergedFile);
//            String s3Url = s3Service.uploadFileMultipart(mergedFile, fileType.toLowerCase() + "s/", fileId);
//
//            filesEntity.setUrl(s3Url);
//            filesEntity.setFileType(fileType);
//            filesEntity.setFileSize(mergedFile.length());
//            filesEntity.setMimeType(fileTypeDetector.detectMimeType(mergedFile));
//            fileRepository.save(filesEntity);
//
//            // 임시 데이터 정리
//            TEMP_FILE_STORAGE.remove(tempFileIdentifier);
//            chunkList.forEach(File::delete);
//
//            return new UploadFileResponseDto("200", "complete", fileId, fileType);
//        } catch (IOException e) {
//            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), ErrorCode.FILE_PROCESSING_FAILED.getMsg());
//        }
//    }
//
//    // 청크를 임시 파일에 추가
//    private void appendChunkToFile(File tempFile, MultipartFile chunkFile) throws IOException {
//        try (FileOutputStream fos = new FileOutputStream(tempFile);
//             InputStream inputStream = chunkFile.getInputStream()) {
//            byte[] buffer = new byte[8192];
//            int bytesRead;
//            while ((bytesRead = inputStream.read(buffer)) != -1) {
//                fos.write(buffer, 0, bytesRead);
//            }
//        }
//    }
//
//    // 청크 파일 병합
//    private File mergeChunks(List<File> chunkList, String tempFileIdentifier) throws IOException {
//        File mergedFile = File.createTempFile("merged_" + tempFileIdentifier, ".tmp");
//
//        try (FileOutputStream fos = new FileOutputStream(mergedFile)) {
//            for (File chunk : chunkList) {
//                try (InputStream inputStream = new FileInputStream(chunk)) {
//                    byte[] buffer = new byte[8192];
//                    int bytesRead;
//                    while ((bytesRead = inputStream.read(buffer)) != -1) {
//                        fos.write(buffer, 0, bytesRead);
//                    }
//                }
//            }
//        } catch (IOException e) {
//            throw new CustomException(ErrorCode.CHUNK_MERGING_FAILED.getCode(), ErrorCode.CHUNK_MERGING_FAILED.getMsg());
//        }
//
//        return mergedFile;
//    }


//
//    @Transactional
//    public void uploadThumbnail(Long fileId, MultipartFile thumbnail) {
//        log.info("upload thumbnail file id: {}", fileId);
//        Files fileEntity = fileRepository.findById(fileId)
//                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), ErrorCode.FILE_NOT_FOUND.getMsg()));
//
//        if (!"VIDEO".equals(fileEntity.getFileType())) {
//            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE.getCode(), ErrorCode.UNSUPPORTED_FILE_TYPE.getMsg());
//        }
//        log.info("upload thumbnail file id: {}", fileId);
//
//        try {
//            String suffix = fileTypeDetector.detectFileTypeFromMultipartFile(thumbnail);
//            log.info("upload thumbnail file id: {}", fileId);
//            File tempFile = File.createTempFile("thumbnail_", suffix);
//            thumbnail.transferTo(tempFile);
//
//            String folder = "thumbnails/";
//            String urlThumbnail = s3Service.uploadFileMultipart(tempFile, folder, fileId);
//
//            fileEntity.setUrlThumbnail(urlThumbnail);
//
//            tempFile.delete();
//        } catch (IOException e) {
//            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), "Failed to process thumbnail file");
//        }
//    }
//
//    @Transactional
//    public UploadFileResponseDto uploadFile(UploadFileRequestDto uploadFileRequestDto) {
//        try {
//            String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(uploadFileRequestDto.getFile());
//
//            Long fileId = null;
//            Files filesEntity = new Files();
//            fileRepository.save(filesEntity);
//            fileId = filesEntity.getFileId();
//
//            String s3Url = uploadEachFile(fileType, fileId, uploadFileRequestDto.getFile());
//
//            filesEntity.setUrl(s3Url);
//            filesEntity.setFileType(fileType);
//            filesEntity.setFileSize(uploadFileRequestDto.getFile().getSize());
//            filesEntity.setMimeType(uploadFileRequestDto.getFile().getContentType());
//
//            fileRepository.save(filesEntity);
//            return new UploadFileResponseDto("200", "complete", fileId, fileType);
//        } catch (Exception e) {
//            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());
//        }
//    }
//
//
//    @Transactional
//    public UploadFilesResponseDto uploadFiles(Long userId, UploadFilesRequestDto uploadFileRequestDto) {
//        MultipartFile[] files = uploadFileRequestDto.getFiles();
//        MultipartFile[] thumbnails = uploadFileRequestDto.getThumbnails();
//
//        List<String> fileTypes = new ArrayList<>();
//        List<Long> fileIds = new ArrayList<>();
//
//        log.info("make fileId arraylist empty");
//
//        for (int i = 0; i < files.length; i++) {
//            Long fileId = null;
//            Files filesEntity = new Files();
//            fileRepository.save(filesEntity);
//            fileId = filesEntity.getFileId();
//
//            MultipartFile file = files[i];
//
//            // 파일 타입 결정
//            String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(file);
//            log.info(fileType);
//
//            String s3Url = uploadEachFile(fileType, fileId, file);
//
//            filesEntity.setUrl(s3Url);
//            filesEntity.setMimeType(file.getContentType());
//            filesEntity.setFileType(fileType);
//            filesEntity.setFileSize(file.getSize());
//
//            fileIds.add(filesEntity.getFileId());
//            fileTypes.add(filesEntity.getFileType());
//
//            if ("VIDEO".equalsIgnoreCase(fileType) && thumbnails != null && i < thumbnails.length && thumbnails[i] != null) {
//                MultipartFile thumbnail = thumbnails[i];
//                String thumbnailUrl = uploadEachFile(fileType, fileId, thumbnail);
//                filesEntity.setUrlThumbnail(thumbnailUrl);
//            }
//            log.info("now saving filesentity");
//            fileRepository.save(filesEntity);
//        }
//        return new UploadFilesResponseDto(fileTypes, fileIds);
//    }
//
//    private String uploadEachFile(String fileType, Long fileId, MultipartFile file) {
//        String folder = defineFolderToUpload(fileType) + "/";
//        return s3Service.uploadFile(file, folder, fileId);
//    }
//
//    public ResponseInputStream<GetObjectResponse> downloadFile(Long fileId) {
//        // 파일 조회
//        Files fileEntity = fileRepository.findById(fileId)
//                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), ErrorCode.FILE_NOT_FOUND.getMsg()));
//
//        // 폴더 결정
//        String folder = defineFolderToUpload(fileEntity.getFileType());
//
//        // S3에서 파일 다운로드
//        return s3Service.downloadFile(folder, fileId);
//    }
//
//
//    @Transactional
//    public ChangeProfileResponseDto changeProfile(Long userId, MultipartFile newImage) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND.getCode(), ErrorCode.USER_NOT_FOUND.getMsg()));
//
//        try {
//            String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(newImage);
//            String s3Url = uploadEachFile(fileType, userId, newImage);
//
//            user.updateProfileImage(s3Url);
//            userRepository.save(user);
//
//            return new ChangeProfileResponseDto(userId, user.getNickname(), s3Url);
//        } catch (Exception e) {
//            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());
//        }
//    }
}