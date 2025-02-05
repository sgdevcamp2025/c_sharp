package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.dto.UploadFileRequestDto;
import com.jootalkpia.file_server.dto.UploadFileResponseDto;
import com.jootalkpia.file_server.entity.Files;
import com.jootalkpia.file_server.entity.User;
import com.jootalkpia.file_server.repository.FileRepository;
import com.jootalkpia.file_server.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
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

    @Transactional
    public UploadFileResponseDto uploadFiles(Long userId, UploadFileRequestDto uploadFileRequestDto) {
        MultipartFile[] files = uploadFileRequestDto.getFiles();
        MultipartFile[] thumbnails = uploadFileRequestDto.getThumbnails();

        List<String> fileTypes = new ArrayList<>();
        List<Long> fileIds = new ArrayList<>();

        try {
            if (files != null && files.length > 0) {
                for (int i = 0; i < files.length; i++) {
                    Long fileId = null;
                    Files filesEntity = new Files();
                    fileRepository.save(filesEntity);
                    fileId = filesEntity.getFileId();

                    MultipartFile file = files[i];

                    // 파일 타입 결정
                    String fileType = FileTypeDetector.detectFileTypeFromMultipartFile(file);

                    // S3에 업로드
                    String s3Url = s3Service.uploadFile(file, fileType, fileId);

                    // DB에 파일 저장
                    filesEntity.setUrl(s3Url);
                    filesEntity.setFileType(fileType);
                    filesEntity.setMimeType(file.getContentType());
                    filesEntity.setFileSize(file.getSize());
                    fileRepository.save(filesEntity);

                    fileIds.add(filesEntity.getFileId());
                    fileTypes.add(filesEntity.getFileType());

                    // 영상 파일일 경우 썸네일 처리
                    if ("VIDEO".equalsIgnoreCase(fileType) && thumbnails != null && i < thumbnails.length && thumbnails[i] != null) {
                        fileId = null;
                        filesEntity = new Files();
                        fileRepository.save(filesEntity);
                        fileId = filesEntity.getFileId();

                        MultipartFile thumbnail = thumbnails[i];
                        String thumbnailUrl = s3Service.uploadFile(thumbnail, "THUMBNAIL", fileId);

                        filesEntity.setUrlThumbnail(thumbnailUrl);

                        fileRepository.save(filesEntity);

//                        fileIds.add(filesEntity.getFileId());
//                        fileTypes.add("THUMBNAIL");
                    }
                }
            }

            return new UploadFileResponseDto(fileTypes, fileIds);

        } catch (Exception e) {
            log.error("파일 업로드 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
        }
    }

    public ResponseInputStream<GetObjectResponse> downloadFile(Long fileId) {
        // 파일 조회
        Files fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found with ID: " + fileId));

        // 폴더 결정
        String folder;
        if ("VIDEO".equalsIgnoreCase(fileEntity.getFileType())) {
            folder = "videos";
        } else if ("IMAGE".equalsIgnoreCase(fileEntity.getFileType())) {
            folder = "images";
        } else if ("THUMBNAIL".equalsIgnoreCase(fileEntity.getFileType())) {
            folder = "thumbnails";
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + fileEntity.getFileType());
        }

        // S3에서 파일 다운로드
        return s3Service.downloadFile(folder, fileId);
    }

    @Transactional
    public String changeProfile(Long userId, MultipartFile newImage) {
        String s3Url = null; // s3Url을 미리 선언

        try {
            if (newImage != null) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

                String fileType = FileTypeDetector.detectFileTypeFromMultipartFile(newImage);

                s3Url = s3Service.uploadFile(newImage, fileType, userId);

                user.updateProfileImage(s3Url);
            }
            return s3Url;

        } catch (Exception e) {
            log.error("파일 업로드 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
        }
    }

}
