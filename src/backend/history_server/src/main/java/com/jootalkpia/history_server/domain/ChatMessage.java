package com.jootalkpia.history_server.domain;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Document(collation = "chatMessage")
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ChatMessage extends BaseTimeEntity {

    @Id
    private ObjectId messageId;       // 메시지 ID

    private Long channelId;          // 채널 ID

    private Long userId;             // 유저 ID

    private String message;          // 내용

    @Builder.Default
    private MessageType messageType = MessageType.TEXT;      // 메시지 타입

    @Builder.Default
    private Boolean isAttachment = false;    // 파일 첨부 여부

    @Builder.Default
    private Long threadId = null;           // 원본 메시지 ID 최초일경우 null
}
