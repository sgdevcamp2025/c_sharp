package com.jootalkpia.chat_server.dto.messgaeDto;

public record CommonResponse(
        Long channelId,
        Long threadId,
        String threadDateTime,
        Long userId,
        String userNickname,
        String userProfileImage
) {
}
