package com.jootalkpia.history_server.dto;

import com.jootalkpia.history_server.domain.ChatMessage;
import com.jootalkpia.history_server.domain.MessageType;

public record ChatMessageSaveRequest(

        Long channelId,          // 채널 ID

        Long userId,             // 유저 ID

        String message,          // 메시지 내용

        MessageType messageType, // 메시지 타입 (TEXT, IMAGE 등)

        Boolean isAttachment,    // 파일 첨부 여부

        Long threadId            // 원본 메시지 ID (최초 메시지일 경우 null)

) {
    public ChatMessage toDocument() {
        return ChatMessage.of(channelId, userId, message, messageType, isAttachment, threadId);
    }
}