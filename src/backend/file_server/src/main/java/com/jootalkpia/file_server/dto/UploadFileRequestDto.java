package com.jootalkpia.file_server.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;


@Getter
@Setter
public class UploadFileRequestDto {
    private Long workspaceId;
    private Long channelId;
    private MultipartFile file;
}