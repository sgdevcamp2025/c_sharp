package com.jootalkpia.file_server.controller;

import com.jootalkpia.file_server.dto.ChangeProfileResponseDto;
import com.jootalkpia.file_server.dto.MultipartChunk;
import com.jootalkpia.file_server.dto.UploadChunkRequestDto;
import com.jootalkpia.file_server.dto.UploadFileRequestDto;
import com.jootalkpia.file_server.dto.UploadFileResponseDto;
import com.jootalkpia.file_server.dto.UploadFilesRequestDto;
import com.jootalkpia.file_server.dto.UploadFilesResponseDto;
import com.jootalkpia.file_server.service.FileService;
import com.jootalkpia.file_server.service.FileTypeDetector;
import com.jootalkpia.file_server.utils.ValidationUtils;
import com.jootalkpia.passport.anotation.CurrentUser;
import com.jootalkpia.passport.component.UserInfo;
import java.util.HashMap;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {
    private final FileService fileService;
    private final FileTypeDetector fileTypeDetector;

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        log.info("Test endpoint hit");
        return ResponseEntity.ok("Test successful");
    }

    @GetMapping("/init-upload/{tempFileIdentifier}")
    public ResponseEntity<Map<String, Object>> initFileUpload(@PathVariable String tempFileIdentifier, @RequestParam String mimeType) {
        log.info("init-upload 요청 받음: {}", tempFileIdentifier);

        // 초기화 처리
        fileService.initiateMultipartUpload(tempFileIdentifier, mimeType);

        // 초기화 완료 응답
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("status", "initialized");
        response.put("message", "업로드 준비 완료");
        return ResponseEntity.ok(response);
    }

//    @DeleteMapping("/fileId")
//    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
//        log.info("got deleteFile id: {}", fileId);
//        fileService.deleteFile(fileId);
//        return ResponseEntity.ok().build();
//    }

    @PostMapping("/thumbnail")
    public ResponseEntity<Map<String, Object>> uploadThumbnail(@RequestParam Long fileId, @RequestPart MultipartFile thumbnail) {
        log.info("got uploadThumbnail id: {}", fileId);
        ValidationUtils.validateFile(thumbnail);
        ValidationUtils.validateFileId(fileId);
        fileService.uploadThumbnail(fileId, thumbnail);
        return ResponseEntity.ok(Map.of("code", 200, "status", "complete"));
    }


    @PostMapping("/chunk")
    public ResponseEntity<?> uploadFileChunk(
            @RequestParam("workspaceId") Long workspaceId,
            @RequestParam("channelId") Long channelId,
            @RequestParam("tempFileIdentifier") String tempFileIdentifier,
            @RequestParam("totalChunks") Long totalChunks,
            @RequestParam("chunkIndex") Long chunkIndex,
            @RequestParam("mimeType") String mimeType,
            @RequestPart("chunk") MultipartFile chunk) {

        log.info("청크 업로드 요청: chunkIndex={}, totalChunks={}", chunkIndex, totalChunks);

        ValidationUtils.validateWorkSpaceId(workspaceId);
        ValidationUtils.validateChannelId(channelId);
        ValidationUtils.validateFile(chunk);
        ValidationUtils.validateFileId(tempFileIdentifier);
        ValidationUtils.validateTotalChunksAndChunkIndex(totalChunks, chunkIndex);

        // DTO로 변환
        MultipartChunk multipartChunk = new MultipartChunk(chunkIndex, chunk);
        UploadChunkRequestDto request = new UploadChunkRequestDto(
                workspaceId, channelId, tempFileIdentifier, totalChunks, mimeType, multipartChunk
        );

        Object response = fileService.uploadChunk(request);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/small")
    public ResponseEntity<UploadFileResponseDto> uploadFile(@ModelAttribute UploadFileRequestDto uploadFileRequest) {
        log.info("got uploadFileRequest: {}", uploadFileRequest.getWorkspaceId());
        ValidationUtils.validateWorkSpaceId(uploadFileRequest.getWorkspaceId());
        ValidationUtils.validateChannelId(uploadFileRequest.getChannelId());
        ValidationUtils.validateFile(uploadFileRequest.getFile());

        UploadFileResponseDto response = fileService.uploadFile(uploadFileRequest);
        return ResponseEntity.ok(response);
    }

    // TODO: url 제공으로 수정
//    @GetMapping("/{fileId}")
//    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable Long fileId) {
//        log.info("got downloadFile id: {}", fileId);
//        ValidationUtils.validateFileId(fileId);
//
//        ResponseInputStream<GetObjectResponse> s3InputStream = fileService.downloadFile(fileId);
//
//        // response 생성
//        long contentLength = s3InputStream.response().contentLength();
//
//        // Content-Type 가져오기 기본값: application/octet-stream
//        String contentType = s3InputStream.response().contentType() != null
//                ? s3InputStream.response().contentType()
//                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
//
//        // 헤더 설정
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.parseMediaType(contentType));
//        headers.setContentLength(contentLength);
//        headers.setContentDispositionFormData("attachment", "file-" + fileId);
//
//        return ResponseEntity.ok()
//                .headers(headers)
//                .body(new InputStreamResource(s3InputStream));
//    }

    @PostMapping("/profile-image")
    public ResponseEntity<ChangeProfileResponseDto> changeProfile(
            @RequestParam("newImage") MultipartFile newImage,
            @CurrentUser UserInfo userInfo) {
        log.info("got new profile Image: {}", newImage);
        ValidationUtils.validateFile(newImage);

        ChangeProfileResponseDto response = fileService.changeProfile(userInfo.userId(), newImage);
        return ResponseEntity.ok(response);
    }
}
