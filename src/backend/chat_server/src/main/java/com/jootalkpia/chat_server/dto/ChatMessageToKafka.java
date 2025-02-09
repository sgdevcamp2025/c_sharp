package com.jootalkpia.chat_server.dto;

public record ChatMessageToKafka(
        Long channelId,
        Long userId,
        String username,
        String content
) {
}
