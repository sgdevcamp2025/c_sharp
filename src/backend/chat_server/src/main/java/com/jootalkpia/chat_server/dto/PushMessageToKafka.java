package com.jootalkpia.chat_server.dto;

public record PushMessageToKafka(
        String sessionId,
        String userNickName,
        String channelId,
        String channelName,
        String workspaceId,
        String text
) {
}
