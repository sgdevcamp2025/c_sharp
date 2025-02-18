package com.jootalkpia.history_server.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.util.List;

@Getter
@Builder
@Document(collection = "chat_messages")
public class ChatMessage extends BaseTimeEntity  {

    @Id
    private String id;  // MongoDB의 ObjectId 자동 생성

    @Field("channel_id")
    private Long channelId;

    @Field("thread_id")
    private Long threadId;

    @Field("thread_date_time")
    private String threadDateTime;

    @Field("user_id")
    private Long userId;

    @Field("user_nickname")
    private String userNickname;

    @Field("user_profile_image")
    private String userProfileImage;

    @Field("messages")
    private List<Message> messages;
}
