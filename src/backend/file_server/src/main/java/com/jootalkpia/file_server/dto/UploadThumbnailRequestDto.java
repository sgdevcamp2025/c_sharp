package com.jootalkpia.file_server.dto;

import org.springframework.web.multipart.MultipartFile;

public class UploadThumbnailRequestDto {
    private Long fileId;
    private MultipartFile thumbnail;
}
