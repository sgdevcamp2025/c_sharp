package com.jootalkpia.chat_server.dto.messgaeDto;

public record CommonResponse(
        Long channelId,
        Long threadId,
        Long userId,
        String userNickname,
        String userProfileImage
) implements MessageResponse {
    @Override
    public String type() {
        return "COMMON";
    }
}
