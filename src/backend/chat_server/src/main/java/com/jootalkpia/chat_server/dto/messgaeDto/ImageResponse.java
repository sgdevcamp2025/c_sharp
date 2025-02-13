package com.jootalkpia.chat_server.dto.messgaeDto;

public record ImageResponse(
        Long imageId,
        String imageUrl
) implements MessageResponse {
    @Override
    public String type() {
        return "IMAGE";
    }
}
