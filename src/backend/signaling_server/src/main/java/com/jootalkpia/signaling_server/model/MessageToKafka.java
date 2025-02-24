package com.jootalkpia.signaling_server.model;

public record MessageToKafka(
        Long channelId,
        String status
) {
}
