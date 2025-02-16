package com.jootalkpia.history_server.dto;

public record CommonDto(
        Long channelId,
        Long threadId,
        String threadDateTime,
        Long userId,
        String userNickname,
        String userProfileImage
) {}
