package com.jootalkpia.chat_server.repository.mongo;

import com.jootalkpia.chat_server.domain.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatMessageRepository extends MongoRepository<ChatMessage,String> {
    Optional<ChatMessage> findFirstByChannelIdOrderByThreadIdDesc(Long channelId);
}
