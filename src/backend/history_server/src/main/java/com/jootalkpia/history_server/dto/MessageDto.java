package com.jootalkpia.history_server.dto;

import com.jootalkpia.history_server.domain.Message;

public record MessageDto(
        String type,
        String text,
        Long imageId,
        String imageUrl,
        Long videoId,
        Long videoThumbnailId,
        String thumbnailUrl,
        String videoUrl
) {
    public Message toMessage() {
        return Message.builder()
                .type(this.type)
                .text(this.text)
                .imageId(this.imageId)
                .imageUrl(this.imageUrl)
                .videoId(this.videoId)
                .videoThumbnailId(this.videoThumbnailId)
                .thumbnailUrl(this.thumbnailUrl)
                .videoUrl(this.videoUrl)
                .build();
    }
}

