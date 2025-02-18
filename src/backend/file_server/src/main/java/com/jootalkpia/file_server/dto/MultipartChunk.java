package com.jootalkpia.file_server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MultipartChunk {
    private Long chunkIndex;
    private MultipartFile chunk;
}