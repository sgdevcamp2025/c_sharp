package com.jootalkpia.history_server.dto;

import com.jootalkpia.history_server.domain.ChatMessage;
import java.util.List;
import java.util.stream.Collectors;

public record ThreadDto(
        Long channelId,
        Long threadId,
        String threadDateTime,
        Long userId,
        String userNickname,
        String userProfileImage,
        List<MessageDto> messages
) {
    public static ThreadDto from(ChatMessage chatMessage) {
        return new ThreadDto(
                chatMessage.getChannelId(),
                chatMessage.getThreadId(),
                chatMessage.getThreadDateTime(),
                chatMessage.getUserId(),
                chatMessage.getUserNickname(),
                chatMessage.getUserProfileImage(),
                chatMessage.getMessages().stream()
                        .map(MessageDto::documentToDto)  // Message 변환
                        .collect(Collectors.toList())
        );
    }
}

