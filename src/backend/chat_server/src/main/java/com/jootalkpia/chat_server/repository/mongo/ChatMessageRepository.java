package com.jootalkpia.chat_server.repository.mongo;

import com.jootalkpia.chat_server.domain.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessage,String> {
    ChatMessage findFirstByChannelIdOrderByThreadIdDesc(Long channelId);
}
