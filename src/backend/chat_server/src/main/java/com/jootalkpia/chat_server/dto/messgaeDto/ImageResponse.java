package com.jootalkpia.chat_server.dto.messgaeDto;

public record ImageResponse(
        String imageUrl
) implements MessageResponse {
    @Override
    public String type() {
        return "IMAGE";
    }
}
