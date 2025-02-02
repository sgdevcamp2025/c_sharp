package com.jootalkpia.history_server.repository;

import com.jootalkpia.history_server.domain.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessage,String> {
}
