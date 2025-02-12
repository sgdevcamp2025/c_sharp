package com.jootalkpia.chat_server.dto.messgaeDto;

public record VideoResponse(
        String thumbnailUrl,
        String videoUrl
) implements MessageResponse {
    @Override
    public String type() {
        return "VIDEO";
    }
}
