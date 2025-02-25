package com.jootalkpia.workspace_server.dto;

public record WorkspaceToKafka(
        Long workspaceId,
        Long ChannelId,
        String ChannelName
) {
}
