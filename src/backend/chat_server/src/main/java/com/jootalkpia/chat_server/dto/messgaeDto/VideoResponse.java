package com.jootalkpia.chat_server.dto.messgaeDto;

public record VideoResponse(
        String urlThumbnail,
        String url
) implements MessageResponse {
    @Override
    public String type() {
        return "VIDEO";
    }
}
