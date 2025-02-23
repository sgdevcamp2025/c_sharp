package com.jootalkpia.file_server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UploadChunkRequestDto {
    private Long workspaceId;
    private Long channelId;
    private String tempFileIdentifier;
    private Long totalChunks;
    private String mimeType;
    private MultipartChunk chunkInfo;
}