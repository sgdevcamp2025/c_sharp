package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.dto.ChangeProfileResponseDto;
import com.jootalkpia.file_server.dto.UploadFileRequestDto;
import com.jootalkpia.file_server.dto.UploadFileResponseDto;
import com.jootalkpia.file_server.entity.Files;
import com.jootalkpia.file_server.entity.User;
import com.jootalkpia.file_server.exception.common.CustomException;
import com.jootalkpia.file_server.exception.common.ErrorCode;
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

        for (int i = 0; i < files.length; i++) {
            Files filesEntity = new Files();
            fileRepository.save(filesEntity);
            fileId = filesEntity.getFileId();

            MultipartFile file = files[i];

            // 파일 타입 결정
            String fileType = FileTypeDetector.detectFileTypeFromMultipartFile(file);

            String s3Url = uploadEachFile(fileType, fileId, file);

            filesEntity.setUrl(s3Url);
            filesEntity.setMimeType(file.getContentType());
            filesEntity.setFileSize(file.getSize());

            fileIds.add(filesEntity.getFileId());
            fileTypes.add(filesEntity.getFileType());

            if ("VIDEO".equalsIgnoreCase(fileType) && thumbnails != null && i < thumbnails.length && thumbnails[i] != null) {
                MultipartFile thumbnail = thumbnails[i];
                String thumbnailUrl = s3Service.uploadFile(thumbnail, "THUMBNAIL", fileId);
                filesEntity.setUrlThumbnail(thumbnailUrl);
            }
            fileRepository.save(filesEntity);
        }
        return new UploadFileResponseDto(fileTypes, fileIds);
    }

    private String uploadEachFile(String fileType, Long fileId, MultipartFile file) {
        return s3Service.uploadFile(file, fileType, fileId);
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

    private String defineFolderToUpload(String fileType) {
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
            String fileType = FileTypeDetector.detectFileTypeFromMultipartFile(newImage);
            String s3Url = uploadEachFile(fileType, userId, newImage);

            user.updateProfileImage(s3Url);
            userRepository.save(user);

            return new ChangeProfileResponseDto(userId, user.getNickname(), s3Url);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());
        }
    }
}
