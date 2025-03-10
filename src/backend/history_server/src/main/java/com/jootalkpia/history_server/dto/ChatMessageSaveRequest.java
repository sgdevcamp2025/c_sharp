package com.jootalkpia.history_server.dto;

import com.jootalkpia.history_server.domain.ChatMessage;
import java.util.List;

public record ChatMessageSaveRequest(
        CommonDto common,
        List<MessageDto> message
) {
    public ChatMessage toDocument() {
        return ChatMessage.builder()
                .channelId(common.channelId())
                .threadId(common.threadId())
                .threadDateTime(common.threadDateTime())
                .userId(common.userId())
                .userNickname(common.userNickname())
                .userProfileImage(common.userProfileImage())
                .messages(
                        message.stream()
                                .map(MessageDto::toMessage) // DTO → 도메인 변환
                                .toList()
                )
                .build();
    }
}
