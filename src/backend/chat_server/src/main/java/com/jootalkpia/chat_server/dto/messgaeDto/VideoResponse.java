package com.jootalkpia.chat_server.dto.messgaeDto;

import lombok.Builder;

@Builder
public record VideoResponse(
        Long videoId,
        String videoUrl,
        String thumbnailUrl
) implements MessageResponse {
    @Override
    public String type() {
        return "VIDEO";
    }
}
