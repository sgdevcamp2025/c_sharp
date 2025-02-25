package com.jootalkpia.chat_server.dto;

public record HuddleToKafka(
        Long channelId,
        String status
) {
}
