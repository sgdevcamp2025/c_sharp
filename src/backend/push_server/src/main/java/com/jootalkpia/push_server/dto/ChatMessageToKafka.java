package com.jootalkpia.push_server.dto;

public record ChatMessageToKafka(
        Long userId,
        String username,
        String content
) {
}
