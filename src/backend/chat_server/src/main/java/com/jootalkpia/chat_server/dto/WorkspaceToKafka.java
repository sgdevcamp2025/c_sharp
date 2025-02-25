package com.jootalkpia.chat_server.dto;

public record WorkspaceToKafka(
        Long workspaceId,
        Long ChannelId,
        String ChannelName
) {
}
