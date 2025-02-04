package com.jootalkpia.file_server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String fileType, Long fileId) {
        try {
            // 폴더 경로 설정
            String folder;
            if ("IMAGE".equalsIgnoreCase(fileType)) {
                folder = "images/";
            } else if ("VIDEO".equalsIgnoreCase(fileType)) {
                folder = "videos/";
            } else if ("THUMBNAIL".equalsIgnoreCase(fileType)) {
                folder = "thumbnails/";
            } else {
                throw new IllegalArgumentException("Unsupported file type: " + fileType);
            }

            // S3에 저장될 파일 키 생성
            String key = folder + fileId;

            // 파일을 임시 디스크에 저장
            Path tempFile = Files.createTempFile("temp-", key);
            file.transferTo(tempFile);

            // S3에 업로드
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    tempFile);

            // 임시 파일 삭제
            Files.deleteIfExists(tempFile);

            log.info("파일 업로드 완료 - S3 Key: {}", key);
            return "https://" + bucketName + ".s3.amazonaws.com/" + key;

        } catch (IOException e) {
            log.error("파일 업로드 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
        }
    }
}
