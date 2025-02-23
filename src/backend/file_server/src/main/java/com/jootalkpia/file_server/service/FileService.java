package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.dto.ChangeProfileResponseDto;
import com.jootalkpia.file_server.dto.UploadChunkRequestDto;
import com.jootalkpia.file_server.dto.UploadFileRequestDto;
import com.jootalkpia.file_server.dto.UploadFilesRequestDto;
import com.jootalkpia.file_server.dto.UploadFileResponseDto;
import com.jootalkpia.file_server.dto.UploadFilesResponseDto;
import com.jootalkpia.file_server.entity.FilesEntity;
import com.jootalkpia.file_server.entity.User;
import com.jootalkpia.file_server.exception.common.CustomException;
import com.jootalkpia.file_server.exception.common.ErrorCode;
import com.jootalkpia.file_server.repository.FileRepository;
import com.jootalkpia.file_server.repository.UserRepository;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    private final S3Service s3Service;
    private final FileRepository fileRepository;
    private final FileTypeDetector fileTypeDetector;
    private final UserRepository userRepository;

    // tempIdentifier: uploadId
    private static final ConcurrentHashMap<String, String> UPLOAD_ID_STORAGE = new ConcurrentHashMap<>();

    // uploadId: etag
    private static final ConcurrentHashMap<String, List<CompletedPart>> PART_TAG_STORAGE = new ConcurrentHashMap<>();

    public void initiateMultipartUpload(String tempFileIdentifier, String mimeType) {
        String uploadId = s3Service.initiateMultipartUpload(tempFileIdentifier, mimeType);
        synchronized (UPLOAD_ID_STORAGE) {
            UPLOAD_ID_STORAGE.put(tempFileIdentifier, uploadId);
            log.info("Upload ID 저장 - TempFileIdentifier: {}, Upload ID: {}", tempFileIdentifier, uploadId);
        }
    }

    public Object uploadChunk(UploadChunkRequestDto request) {
        MultipartFile chunkFile = request.getChunkInfo().getChunk();
        String tempFileIdentifier = request.getTempFileIdentifier();
        int totalChunks = request.getTotalChunks().intValue();
        int chunkIndex = request.getChunkInfo().getChunkIndex().intValue();
        String mimeType = request.getMimeType();
        log.info(tempFileIdentifier);

        log.info("uploadFileChunk request: {}", chunkIndex);
        log.info("UPLOAD_ID_STORAGE 상태 - Size: {}, Keys: {}", UPLOAD_ID_STORAGE.size(), UPLOAD_ID_STORAGE.keySet());

        String uploadId = UPLOAD_ID_STORAGE.get(tempFileIdentifier);
        if (uploadId == null) {
            log.error("uploadId 없음 - tempFileIdentifier: {}", tempFileIdentifier);
            throw new CustomException(ErrorCode.CHUNK_INITIALIZE_FAILED.getCode(), ErrorCode.CHUNK_INITIALIZE_FAILED.getMsg());
        }

        log.info("청크 업로드 중 - Upload ID: {}, Chunk Index: {}", uploadId, chunkIndex);

        String s3Key = s3Service.makeKey(tempFileIdentifier, mimeType);
        try {
            CompletableFuture<CompletedPart> future = s3Service.asyncUploadPartToS3(tempFileIdentifier, uploadId, chunkIndex, chunkFile.getBytes(), s3Key);

            future.thenAccept(completedPart -> {
                synchronized (PART_TAG_STORAGE) {
                    PART_TAG_STORAGE.computeIfAbsent(uploadId, k -> new ArrayList<>()).add(completedPart);
                }

                // 마지막 청크 여부 확인
                if (isLastChunk(totalChunks, uploadId)) {
                    synchronized (PART_TAG_STORAGE) {
                        s3Service.completeMultipartUpload(tempFileIdentifier, uploadId, PART_TAG_STORAGE.get(uploadId),
                                mimeType);
                        log.info("모든 청크 업로드 완료 및 병합 완료: {}", uploadId);

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

            // 각 청크 업로드 완료 시 응답
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("status", "partial");
            response.put("message", "청크 업로드 완료");
            return response;

        } catch (IOException e) {
            throw new CustomException(ErrorCode.CHUNK_PROCESSING_FAILED.getCode(), ErrorCode.CHUNK_PROCESSING_FAILED.getMsg());
        }
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

    @Transactional
    public void uploadThumbnail(Long fileId, MultipartFile thumbnail) {
        log.info("upload thumbnail file id: {}", fileId);
        FilesEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), ErrorCode.FILE_NOT_FOUND.getMsg()));

        if (!"VIDEO".equals(fileEntity.getFileType())) {
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE.getCode(), ErrorCode.UNSUPPORTED_FILE_TYPE.getMsg());
        }
        log.info("upload thumbnail file id: {}", fileId);

        try {
            String suffix = fileTypeDetector.detectFileTypeFromMultipartFile(thumbnail);
            log.info("upload thumbnail file id: {}", fileId);

            // 임시 파일 생성 (Path -> File 변환)
            Path tempPath = java.nio.file.Files.createTempFile("thumbnail_", suffix);
            File tempFile = tempPath.toFile(); // Path -> File 변환

            // MultipartFile -> File 전송
            thumbnail.transferTo(tempFile);

            String folder = "thumbnails/";
            String urlThumbnail = s3Service.uploadFileMultipart(tempFile, folder, fileId);

            fileEntity.setUrlThumbnail(urlThumbnail);
            fileRepository.save(fileEntity);

            // 임시 파일 삭제
            if (tempFile.exists()) {
                tempFile.delete();
            }
        } catch (IOException e) {
            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), "Failed to process thumbnail file");
        }
    }

    @Transactional
    public UploadFileResponseDto uploadFile(UploadFileRequestDto uploadFileRequestDto) {
        try {
            String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(uploadFileRequestDto.getFile());

            Long fileId = null;
            FilesEntity filesEntity = new FilesEntity();
            fileRepository.save(filesEntity);
            fileId = filesEntity.getFileId();

            String s3Url = uploadEachFile(fileType, fileId, uploadFileRequestDto.getFile());

            filesEntity.setUrl(s3Url);
            filesEntity.setFileType(fileType);
            filesEntity.setFileSize(uploadFileRequestDto.getFile().getSize());
            filesEntity.setMimeType(uploadFileRequestDto.getFile().getContentType());

            fileRepository.save(filesEntity);
            return new UploadFileResponseDto("200", "complete", fileId, fileType);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());
        }
    }


    @Transactional
    public UploadFilesResponseDto uploadFiles(Long userId, UploadFilesRequestDto uploadFileRequestDto) {
        MultipartFile[] files = uploadFileRequestDto.getFiles();
        MultipartFile[] thumbnails = uploadFileRequestDto.getThumbnails();

        List<String> fileTypes = new ArrayList<>();
        List<Long> fileIds = new ArrayList<>();

        log.info("make fileId arraylist empty");

        for (int i = 0; i < files.length; i++) {
            Long fileId = null;
            FilesEntity filesEntity = new FilesEntity();
            fileRepository.save(filesEntity);
            fileId = filesEntity.getFileId();

            MultipartFile file = files[i];

            // 파일 타입 결정
            String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(file);
            log.info(fileType);

            String s3Url = uploadEachFile(fileType, fileId, file);

            filesEntity.setUrl(s3Url);
            filesEntity.setMimeType(file.getContentType());
            filesEntity.setFileType(fileType);
            filesEntity.setFileSize(file.getSize());

            fileIds.add(filesEntity.getFileId());
            fileTypes.add(filesEntity.getFileType());

            if ("VIDEO".equalsIgnoreCase(fileType) && thumbnails != null && i < thumbnails.length && thumbnails[i] != null) {
                MultipartFile thumbnail = thumbnails[i];
                String thumbnailUrl = uploadEachFile(fileType, fileId, thumbnail);
                filesEntity.setUrlThumbnail(thumbnailUrl);
            }
            log.info("now saving filesentity");
            fileRepository.save(filesEntity);
        }
        return new UploadFilesResponseDto(fileTypes, fileIds);
    }

    private String uploadEachFile(String fileType, Long fileId, MultipartFile file) {
        String folder = defineFolderToUpload(fileType) + "/";
        return s3Service.uploadFile(file, folder, fileId);
    }

    public ResponseInputStream<GetObjectResponse> downloadFile(Long fileId) {
        // 파일 조회
        FilesEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), ErrorCode.FILE_NOT_FOUND.getMsg()));

        // 폴더 결정
        String folder = defineFolderToUpload(fileEntity.getFileType());

        // S3에서 파일 다운로드
        return s3Service.downloadFile(folder, fileId);
    }


    @Transactional
    public ChangeProfileResponseDto changeProfile(Long userId, MultipartFile newImage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND.getCode(), ErrorCode.USER_NOT_FOUND.getMsg()));

        try {
            String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(newImage);
            String s3Url = uploadEachFile(fileType, userId, newImage);

            user.updateProfileImage(s3Url);
            userRepository.save(user);

            return new ChangeProfileResponseDto(userId, user.getNickname(), s3Url);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());
        }
    }
}