package com.jootalkpia.chat_server.dto;

public record ChatMessageToKafka(
        Long userId,
        String username,
        String content
) {
}
