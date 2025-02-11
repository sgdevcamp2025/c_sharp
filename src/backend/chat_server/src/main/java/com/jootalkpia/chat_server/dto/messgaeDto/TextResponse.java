package com.jootalkpia.chat_server.dto.messgaeDto;

public record TextResponse(
        String text
) implements MessageResponse {
    @Override
    public String type() {
        return "TEXT";
    }
}
