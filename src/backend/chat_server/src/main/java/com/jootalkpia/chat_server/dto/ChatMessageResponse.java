package com.jootalkpia.chat_server.dto;

public record ChatMessageResponse(
        String username,
        String content
) {
}
