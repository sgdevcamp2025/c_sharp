package com.jootalkpia.history_server.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jootalkpia.history_server.domain.Message;

@JsonInclude(JsonInclude.Include.NON_NULL)
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
    public static MessageDto mongoToDto(Message message) {
        return new MessageDto(
                message.getType(),
                message.getText(),
                message.getImageId(),
                message.getImageUrl(),
                message.getVideoId(),
                message.getVideoThumbnailId(),
                message.getThumbnailUrl(),
                message.getVideoUrl()
        );
    }
}

