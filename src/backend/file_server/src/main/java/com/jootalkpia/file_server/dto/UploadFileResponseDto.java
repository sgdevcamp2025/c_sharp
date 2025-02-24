package com.jootalkpia.file_server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UploadFileResponseDto {
    private String code;
    private String status;
    private Long fileId;
    private String fileType;
}