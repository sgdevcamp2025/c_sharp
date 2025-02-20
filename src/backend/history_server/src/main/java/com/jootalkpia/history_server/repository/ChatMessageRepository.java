package com.jootalkpia.history_server.repository;

import com.jootalkpia.history_server.domain.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // 첫 페이지 요청 (cursorId가 없는 경우)
    List<ChatMessage> findByChannelIdOrderByThreadIdAsc(Long channelId, Pageable pageable);

    // cursorId 이후의 메시지 조회 (페이징)
    List<ChatMessage> findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(Long channelId, Long threadId, Pageable pageable);
}
