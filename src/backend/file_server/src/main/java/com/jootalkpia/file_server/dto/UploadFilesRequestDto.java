package com.jootalkpia.file_server.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UploadFilesRequestDto {
    private Long workspaceId;
    private Long channelId;
    private MultipartFile[] files;
    private MultipartFile[] thumbnails;
}