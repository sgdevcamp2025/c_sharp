package com.jootalkpia.chat_server.dto;

public record ReadCountMessage(
        String channelId,
        String channelName
) {
    public static ReadCountMessage from(PushMessageToKafka pushMessageToKafka) {
        return new ReadCountMessage(pushMessageToKafka.channelId(), pushMessageToKafka.channelName());
    }
}
