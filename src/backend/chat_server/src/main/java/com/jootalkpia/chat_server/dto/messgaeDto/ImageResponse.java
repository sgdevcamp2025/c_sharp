package com.jootalkpia.chat_server.dto.messgaeDto;

import lombok.Builder;

@Builder
public record ImageResponse(
        Long imageId,
        String imageUrl
) implements MessageResponse {
    @Override
    public String type() {
        return "IMAGE";
    }
}
