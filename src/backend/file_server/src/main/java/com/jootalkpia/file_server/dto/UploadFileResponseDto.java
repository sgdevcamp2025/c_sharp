package com.jootalkpia.file_server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UploadFileResponseDto {
    private Long fileId;
    private String fileType;
}