package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.dto.UploadFileRequestDto;
import com.jootalkpia.file_server.dto.UploadFileResponseDto;
import com.jootalkpia.file_server.entity.File;
import com.jootalkpia.file_server.repository.FileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final S3Service s3Service;

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
                    File fileEntity = new File();
                    fileRepository.save(fileEntity);
                    fileId = fileEntity.getFile_id();

                    MultipartFile file = files[i];

                    // 파일 타입 결정
                    String fileType = FileTypeDetector.detectFileTypeFromMultipartFile(file);

                    // S3에 업로드
                    String s3Url = s3Service.uploadFile(file, fileType, fileId);

                    // DB에 파일 저장
                    fileEntity.setUrl(s3Url);
                    fileEntity.setFile_type(fileType);
                    fileEntity.setMime_type(file.getContentType());
                    fileEntity.setFile_size(file.getSize());
                    fileRepository.save(fileEntity);

                    fileIds.add(fileEntity.getFile_id());
                    fileTypes.add(fileEntity.getFile_type());

                    // 영상 파일일 경우 썸네일 처리
                    if ("VIDEO".equalsIgnoreCase(fileType) && thumbnails != null && i < thumbnails.length && thumbnails[i] != null) {
                        fileId = null;
                        fileEntity = new File();
                        fileRepository.save(fileEntity);
                        fileId = fileEntity.getFile_id();

                        MultipartFile thumbnail = thumbnails[i];
                        String thumbnailUrl = s3Service.uploadFile(thumbnail, "THUMBNAIL", fileId);

                        File thumbnailEntity = new File();
                        thumbnailEntity.setUrl(thumbnailUrl);
                        thumbnailEntity.setFile_type("THUMBNAIL");
                        thumbnailEntity.setMime_type(thumbnail.getContentType());
                        thumbnailEntity.setFile_size(thumbnail.getSize());
                        fileRepository.save(thumbnailEntity);

                        fileIds.add(thumbnailEntity.getFile_id());
                        fileTypes.add("THUMBNAIL");
                    }
                }
            }

            return new UploadFileResponseDto(fileTypes, fileIds);

        } catch (Exception e) {
            log.error("파일 업로드 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
        }
    }
}
