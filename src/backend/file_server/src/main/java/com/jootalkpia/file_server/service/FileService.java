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
import jakarta.transaction.Transactional;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final FileTypeDetector fileTypeDetector;

    // 청크 저장을 위한 Map (tempFileIdentifier 기준으로 리스트 저장)
    private static final ConcurrentHashMap<String, List<File>> TEMP_FILE_STORAGE = new ConcurrentHashMap<>();

    @Transactional
    public Object uploadFileChunk(UploadChunkRequestDto request) {
        MultipartFile chunkFile = request.getChunkInfo().getChunk();
        String tempFileIdentifier = request.getTempFileIdentifier();
        int totalChunks = request.getTotalChunks().intValue();
        int chunkIndex = request.getChunkInfo().getChunkIndex().intValue();

        log.info("Processing chunk {} of {}", chunkIndex, totalChunks);

        try {
            // 청크 저장 리스트 불러오고 없으면 생성
            List<File> chunkList = TEMP_FILE_STORAGE.computeIfAbsent(tempFileIdentifier, k -> new ArrayList<>(totalChunks));

            // 리스트 크기를 totalChunks 크기로 확장
            while (chunkList.size() < totalChunks) {
                chunkList.add(null);
            }

            int adjustedIndex = chunkIndex - 1;

            File tempChunkFile = File.createTempFile("chunk_" + chunkIndex, ".part");
            appendChunkToFile(tempChunkFile, chunkFile);
            chunkList.set(adjustedIndex, tempChunkFile);

            // 모든 청크가 수신 완료되었는지 확인 (전체 크기가 맞으면 병합)
            if (chunkList.size() == totalChunks && chunkList.stream().allMatch(java.util.Objects::nonNull)) {
                log.info("모든 청크가 도착함 - 병합 시작 (임시 파일 ID: {})", tempFileIdentifier);
                return finalizeFileUpload(tempFileIdentifier, chunkList);
            }
        } catch (IOException e) {
            throw new CustomException(ErrorCode.CHUNK_PROCESSING_FAILED.getCode(), ErrorCode.CHUNK_PROCESSING_FAILED.getMsg());
        }

        // 병합이 완료되지 않은 경우 기본 응답 반환
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("status", "partial");
        return response;
    }

    private UploadFileResponseDto finalizeFileUpload(String tempFileIdentifier, List<File> chunkList) {
        try {
            File mergedFile = mergeChunks(chunkList, tempFileIdentifier);

            Files filesEntity = new Files();
            fileRepository.save(filesEntity);
            Long fileId = filesEntity.getFileId();

            // S3 업로드
            String fileType = fileTypeDetector.detectFileTypeFromFile(mergedFile);
            String s3Url = s3Service.uploadFileMultipart(mergedFile, fileType.toLowerCase() + "s/", fileId);

            filesEntity.setUrl(s3Url);
            filesEntity.setFileType(fileType);
            filesEntity.setFileSize(mergedFile.length());
            fileRepository.save(filesEntity);

            // 임시 데이터 정리
            TEMP_FILE_STORAGE.remove(tempFileIdentifier);
            chunkList.forEach(File::delete);

            return new UploadFileResponseDto("200", "complete", fileId, fileType);
        } catch (IOException e) {
            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), ErrorCode.FILE_PROCESSING_FAILED.getMsg());
        }
    }

    // 청크를 임시 파일에 추가
    private void appendChunkToFile(File tempFile, MultipartFile chunkFile) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(tempFile);
             InputStream inputStream = chunkFile.getInputStream()) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                fos.write(buffer, 0, bytesRead);
            }
        }
    }

    // 청크 파일 병합
    private File mergeChunks(List<File> chunkList, String tempFileIdentifier) throws IOException {
        File mergedFile = File.createTempFile("merged_" + tempFileIdentifier, ".tmp");

        try (FileOutputStream fos = new FileOutputStream(mergedFile)) {
            for (File chunk : chunkList) {
                try (InputStream inputStream = new FileInputStream(chunk)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        fos.write(buffer, 0, bytesRead);
                    }
                }
            }
        } catch (IOException e) {
            throw new CustomException(ErrorCode.CHUNK_MERGING_FAILED.getCode(), ErrorCode.CHUNK_MERGING_FAILED.getMsg());
        }

        return mergedFile;
    }

    @Transactional
    public void uploadThumbnail(Long fileId, MultipartFile thumbnail) {
        log.info("upload thumbnail file id: {}", fileId);
        Files fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), ErrorCode.FILE_NOT_FOUND.getMsg()));

        if (!"VIDEO".equals(fileEntity.getFileType())) {
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE.getCode(), ErrorCode.UNSUPPORTED_FILE_TYPE.getMsg());
        }
        log.info("upload thumbnail file id: {}", fileId);

        try {
            String suffix = fileTypeDetector.detectFileTypeFromMultipartFile(thumbnail);
            log.info("upload thumbnail file id: {}", fileId);
            File tempFile = File.createTempFile("thumbnail_", suffix);
            thumbnail.transferTo(tempFile);

            String folder = "thumbnails/";
            String urlThumbnail = s3Service.uploadFileMultipart(tempFile, folder, fileId);

            fileEntity.setUrlThumbnail(urlThumbnail);

            tempFile.delete();
        } catch (IOException e) {
            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), "Failed to process thumbnail file");
        }
    }

    @Transactional
    public UploadFileResponseDto uploadFile(UploadFileRequestDto uploadFileRequestDto) {
        try {
            String fileType = fileTypeDetector.detectFileTypeFromMultipartFile(uploadFileRequestDto.getFile());

            Long fileId = null;
            Files filesEntity = new Files();
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
            Files filesEntity = new Files();
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
        Files fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), ErrorCode.FILE_NOT_FOUND.getMsg()));

        // 폴더 결정
        String folder = defineFolderToUpload(fileEntity.getFileType());

        // S3에서 파일 다운로드
        return s3Service.downloadFile(folder, fileId);
    }

    public String defineFolderToUpload(String fileType) {
        if ("VIDEO".equalsIgnoreCase(fileType)) {
            return "videos";
        } else if ("IMAGE".equalsIgnoreCase(fileType)) {
            return "images";
        } else if ("THUMBNAIL".equalsIgnoreCase(fileType)) {
            return "thumbnails";
        } else {
            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), ErrorCode.FILE_PROCESSING_FAILED.getMsg());
        }
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