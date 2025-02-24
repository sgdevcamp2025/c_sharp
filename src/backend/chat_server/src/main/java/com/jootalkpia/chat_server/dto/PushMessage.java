package com.jootalkpia.chat_server.dto;

public record PushMessage(
        String userNickname,
        String channelName,
        String text
) {
    public static PushMessage from(PushMessageToKafka pushMessageToKafka) {
        return new PushMessage(pushMessageToKafka.userNickName(), pushMessageToKafka.channelName(), pushMessageToKafka.text());
    }
}
