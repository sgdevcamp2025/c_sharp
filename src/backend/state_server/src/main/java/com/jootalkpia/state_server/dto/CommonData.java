package com.jootalkpia.state_server.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record CommonData(
        String channelId,
        String threadId,
        String threadDateTime,
        String userId,
        String userNickName,
        String userProfileImage
) {

    public static CommonData from(JsonNode common) {
        return new CommonData(
                common.get("channelId").asText(),
                common.get("threadId").asText(),
                common.get("threadDateTime").asText(),
                common.get("userId").asText(),
                common.get("userNickname").asText(),
                common.get("userProfileImage").asText()
        );
    }
}
