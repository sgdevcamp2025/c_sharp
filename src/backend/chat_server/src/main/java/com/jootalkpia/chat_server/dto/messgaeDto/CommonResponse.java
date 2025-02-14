package com.jootalkpia.chat_server.dto.messgaeDto;

import lombok.Builder;

@Builder
public record CommonResponse(
        Long channelId,
        Long threadId,
        String threadDateTime,
        Long userId,
        String userNickname,
        String userProfileImage
) {
}
