package com.jootalkpia.file_server.controller;

import com.jootalkpia.file_server.dto.ChangeProfileResponseDto;
import com.jootalkpia.file_server.dto.UploadFileRequestDto;
import com.jootalkpia.file_server.dto.UploadFileResponseDto;
import com.jootalkpia.file_server.service.FileService;
import com.jootalkpia.file_server.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class FileController {
    private final FileService fileService;
    private final Long userId = 1L;//JootalkpiaAuthenticationContext.getUserInfo().userId();

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        log.info("Test endpoint hit");
        return ResponseEntity.ok("Test successful");
    }

    @PostMapping("/files")
    public ResponseEntity<UploadFileResponseDto> uploadFiles(@ModelAttribute UploadFileRequestDto uploadFileRequest) {
        log.info("got uploadFileRequest: {}", uploadFileRequest);
        ValidationUtils.validateLengthOfFilesAndThumbnails(uploadFileRequest.getFiles().length, uploadFileRequest.getThumbnails().length);
        ValidationUtils.validateWorkSpaceId(uploadFileRequest.getWorkspaceId());
        ValidationUtils.validateChannelId(uploadFileRequest.getChannelId());
        ValidationUtils.validateFiles(uploadFileRequest.getFiles());
        ValidationUtils.validateFiles(uploadFileRequest.getThumbnails());

        UploadFileResponseDto response = fileService.uploadFiles(userId, uploadFileRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable Long fileId) {
        log.info("got downloadFile id: {}", fileId);
        ValidationUtils.validateFileId(fileId);

        ResponseInputStream<GetObjectResponse> s3InputStream = fileService.downloadFile(fileId);

        // response 생성
        long contentLength = s3InputStream.response().contentLength();

        // Content-Type 가져오기 기본값: application/octet-stream
        String contentType = s3InputStream.response().contentType() != null
                ? s3InputStream.response().contentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentLength(contentLength);
        headers.setContentDispositionFormData("attachment", "file-" + fileId);

        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(s3InputStream));
    }

    @PostMapping("/{userId}/profile-image")
    public ResponseEntity<ChangeProfileResponseDto> changeProfile(
            @PathVariable Long userId,
            @RequestParam("newImage") MultipartFile newImage) {
        log.info("got new profile Image: {}", newImage);
        ValidationUtils.validateFile(newImage);

        ChangeProfileResponseDto response = fileService.changeProfile(userId, newImage);
        return ResponseEntity.ok(response);
    }
}
