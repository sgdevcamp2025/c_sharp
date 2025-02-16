package com.jootalkpia.chat_server.dto.messgaeDto;

import lombok.Builder;

@Builder
public record TextResponse(
        String text
) implements MessageResponse {
    @Override
    public String type() {
        return "TEXT";
    }
}
