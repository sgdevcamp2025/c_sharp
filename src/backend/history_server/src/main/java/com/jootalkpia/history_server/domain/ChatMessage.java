package com.jootalkpia.history_server.domain;

import lombok.Getter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Document(collation = "chatMessage")
public class ChatMessage extends BaseTimeEntity {

    @Id
    private ObjectId messageId;       // 메시지 ID

    private Long channelId;          // 채널 ID

    private Long userId;             // 유저 ID

    private String message;          // 내용

    private MessageType messageType = MessageType.TEXT;      // 메시지 타입

    private Boolean isAttachment = false;    // 파일 첨부 여부

    private Long threadId = null;           // 원본 메시지 ID 최초일경우 null

    protected ChatMessage() {
    }

    private ChatMessage(Long channelId, Long userId, String message, MessageType messageType, Boolean isAttachment, Long threadId) {
        this.channelId = channelId;
        this.userId = userId;
        this.message = message;
        this.messageType = messageType;
        this.isAttachment = isAttachment;
        this.threadId = threadId;
    }

    public static ChatMessage of(Long channelId, Long userId, String message, MessageType messageType, Boolean isAttachment, Long threadId) {
        return new ChatMessage(channelId, userId, message, messageType, isAttachment, threadId);
    }
}
