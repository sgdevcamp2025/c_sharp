package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.entity.FilesEntity;
import com.jootalkpia.file_server.exception.common.CustomException;
import com.jootalkpia.file_server.exception.common.ErrorCode;
import com.jootalkpia.file_server.repository.FileRepository;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.*;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final S3AsyncClient s3AsyncClient;
    private final FileTypeDetector fileTypeDetector;
    private final FileRepository fileRepository;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${spring.cloud.aws.region.static}")
    private String region;

    public String makeKey(Long fileId, String mimeType) {
        String filePath;
        if (mimeType.startsWith("video/")) {
            filePath = "videos/";
        } else filePath = "images/";
        return filePath + fileId;
    }

    public String initiateMultipartUpload(Long fileId, String mimeType) {

        String s3Key = makeKey(fileId, mimeType);

        log.info("initialized with s3key : {}", s3Key);

        CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        try {
            CompletableFuture<CreateMultipartUploadResponse> createResponse = s3AsyncClient.createMultipartUpload(createRequest);
            String uploadId = createResponse.join().uploadId();
            log.info("S3 멀티파트 업로드 초기화: {}, uploadId: {}", fileId, uploadId);
            return uploadId;
        } catch (Exception e) {
            log.error("S3 멀티파트 업로드 초기화 실패: {}", fileId, e);
            throw new CustomException(ErrorCode.FILE_PROCESSING_FAILED.getCode(), "S3 멀티파트 업로드 초기화 실패");
        }
    }

    public CompletableFuture<CompletedPart> asyncUploadPartToS3(Long fileId, String uploadId, int partNumber, byte[] chunkData, String s3Key) {
        UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
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

    public void completeMultipartUpload(Long fileId, String uploadId, List<CompletedPart> completedParts, String mimeType) {
        String s3Key = makeKey(fileId, mimeType);

        completedParts.sort(Comparator.comparingInt(CompletedPart::partNumber));

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
                    log.info("source {}", bucketName+s3Key);

                    // Content-Type 설정을 위한 CopyObjectRequest 추가
                    CopyObjectRequest copyObjectRequest = CopyObjectRequest.builder()
                            .sourceBucket(bucketName)
                            .sourceKey(s3Key)
                            .destinationBucket(bucketName)
                            .destinationKey(s3Key)
                            .contentType(mimeType)
                            .metadataDirective(MetadataDirective.REPLACE.toString())
                            .build();

                    s3AsyncClient.copyObject(copyObjectRequest)
                            .thenAccept(copyObjectResponse -> {
                                log.info("S3 Content-Type 설정 완료: {}, 타입: {}", s3Key, mimeType);

                                // FilesEntity 가져오기 및 URL 업데이트
                                FilesEntity filesEntity = fileRepository.findById(fileId)
                                        .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), "해당 ID의 파일을 찾을 수 없습니다."));

                                filesEntity.setUrl(completeMultipartUploadResponse.location());
                                fileRepository.save(filesEntity);
                            }).exceptionally(ex -> {
                                log.error("S3 Content-Type 설정 실패: {}", s3Key, ex);
                                throw new CustomException(ErrorCode.CONTENT_TYPE_SETTING_FAILED.getCode(), "Content-Type 설정 실패");
                            });

                }).exceptionally(ex -> {
                    log.error("S3 멀티파트 업로드 병합 실패: {}", s3Key, ex);
                    throw new CustomException(ErrorCode.CHUNK_MERGING_FAILED.getCode(), ErrorCode.CHUNK_MERGING_FAILED.getMsg());
                });
    }


    // 멀티파트 업로드 방식으로 S3에 파일 업로드
    public String uploadFileMultipart(File file, String folder, Long fileId) {
        String key = folder + fileId;
        log.info("S3 멀티파트 업로드 시작: {}", key);

        // 멀티파트 업로드 시작
        CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(fileTypeDetector.detectMimeType(file))
                .build();

        CreateMultipartUploadResponse createResponse = s3Client.createMultipartUpload(createRequest);
        String uploadId = createResponse.uploadId();
        List<CompletedPart> completedParts = new ArrayList<>();

        try (InputStream inputStream = new FileInputStream(file)) {
            byte[] buffer = new byte[5 * 1024 * 1024]; // 5MB 청크
            int bytesRead;
            int partNumber = 1;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                byte[] chunkData = Arrays.copyOf(buffer, bytesRead);

                UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .uploadId(uploadId)
                        .partNumber(partNumber)
                        .build();

                UploadPartResponse uploadPartResponse = s3Client.uploadPart(
                        uploadPartRequest,
                        RequestBody.fromBytes(chunkData)
                );

                completedParts.add(CompletedPart.builder()
                        .partNumber(partNumber)
                        .eTag(uploadPartResponse.eTag())
                        .build());

                log.info("청크 업로드 완료 - 파트 번호: {}", partNumber);
                partNumber++;
            }


            // 업로드 완료
            CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .uploadId(uploadId)
                    .multipartUpload(CompletedMultipartUpload.builder()
                            .parts(completedParts)
                            .build())
                    .build();

            s3Client.completeMultipartUpload(completeRequest);
            log.info("멀티파트 업로드 완료: {}", key);

            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;

        } catch (IOException e) {
            log.error("멀티파트 업로드 실패: {}", e.getMessage());
            abortMultipartUpload(bucketName, key, uploadId);
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());
        }
    }

    // 멀티파트 업로드 실패 시 업로드 취소
    private void abortMultipartUpload(String bucket, String key, String uploadId) {
        try {
            AbortMultipartUploadRequest abortRequest = AbortMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .uploadId(uploadId)
                    .build();

            s3Client.abortMultipartUpload(abortRequest);
            log.warn("멀티파트 업로드 취소 완료: {}", key);

        } catch (Exception ex) {
            log.error("멀티파트 업로드 취소 실패: {}", ex.getMessage());
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());
        }
    }


    public String uploadFile(MultipartFile file, String folder, Long fileId) {
        java.nio.file.Path tempPath = null;
        log.info("Ready to upload file to S3 bucket: {}", bucketName);
        try {
            // S3에 저장될 파일 키 생성
            String key = folder + fileId;

            // 임시 파일 생성 (Path -> File 변환)
            tempPath = java.nio.file.Files.createTempFile("temp-", ".tmp");
            java.io.File tempFile = tempPath.toFile();

            // MultipartFile -> File 전송
            file.transferTo(tempFile);

            // S3에 업로드
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    tempPath);

            log.info("파일 업로드 완료 - S3 Key: {}", "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key);
            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;

        } catch (IOException e) {
            log.error("파일 업로드 중 IOException 발생: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), ErrorCode.IMAGE_UPLOAD_FAILED.getMsg());

        } catch (SdkClientException e) {
            log.error("S3 클라이언트 예외 발생: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED.getCode(), "S3 클라이언트 오류 발생");

        } catch (Exception e) {
            log.error("알 수 없는 오류 발생: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.UNKNOWN.getCode(), "알 수 없는 오류 발생");

        } finally {
            // 임시 파일 삭제
            try {
                if (tempPath != null && java.nio.file.Files.exists(tempPath)) {
                    java.nio.file.Files.delete(tempPath);
                    log.info("임시 파일 삭제 완료: {}", tempPath);
                }
            } catch (IOException e) {
                log.warn("임시 파일 삭제 실패: {}", e.getMessage(), e);
            }
        }
    }


    public ResponseInputStream<GetObjectResponse> downloadFile(String folder, Long fileId) {
        String key = folder + "/" + fileId;

        try {
            return s3Client.getObject(
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build());

        } catch (NoSuchKeyException e) {
            log.error("S3에서 파일을 찾을 수 없음: key={}", key, e);
            throw new CustomException(ErrorCode.FILE_NOT_FOUND.getCode(), ErrorCode.FILE_NOT_FOUND.getMsg());

        } catch (SdkClientException e) {
            log.error("S3 클라이언트 오류 발생: key={}, 오류={}", key, e.getMessage(), e);
            throw new CustomException(ErrorCode.IMAGE_DOWNLOAD_FAILED.getCode(), ErrorCode.IMAGE_DOWNLOAD_FAILED.getMsg());

        } catch (Exception e) {
            log.error("S3 파일 다운로드 중 오류 발생 - key: {}, 오류: {}", key, e.getMessage(), e);
            throw new CustomException(ErrorCode.IMAGE_DOWNLOAD_FAILED.getCode(), ErrorCode.IMAGE_DOWNLOAD_FAILED.getMsg());
        }
    }
}