package com.jootalkpia.state_server.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.jootalkpia.state_server.entity.common.MessageType;

public record PushMessageToKafka(
        String sessionId,
        String userNickName,
        String channelId,
        String channelName,
        String workspaceId,
        String text
) {
    public static PushMessageToKafka from(String sessionId, CommonData commonData, JsonNode messagesNode, ChannelInfo channelInfo) {
        JsonNode firstMessageNode = messagesNode.get(0);
        String messageType = firstMessageNode.get("type").asText();
        MessageType type = MessageType.from(messageType);

        return new PushMessageToKafka(
                sessionId,
                commonData.userNickName(),
                commonData.channelId(),
                channelInfo.name(),
                String.valueOf(channelInfo.workSpaceId()),
                type.createText(firstMessageNode)
        );
    }
}
