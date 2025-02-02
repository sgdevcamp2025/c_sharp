package com.jootalkpia.chat_server.dto;

public record ChatMessageRequest(
        Long userId,
        String content
) {
}
