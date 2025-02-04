package com.jootalkpia.file_server.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class UploadFileResponseDto {
    private List<String> fileTypes; // IMAGE, VIDEO, THUMBNAIL
    private List<Long> fileIds;
}
