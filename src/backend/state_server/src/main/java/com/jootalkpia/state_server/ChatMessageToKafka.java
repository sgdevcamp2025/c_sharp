package com.jootalkpia.state_server;

public record ChatMessageToKafka(
        Long userId,
        String username,
        String content
) {
}
