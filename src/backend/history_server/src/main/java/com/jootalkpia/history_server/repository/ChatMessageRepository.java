package com.jootalkpia.history_server.repository;

import com.jootalkpia.history_server.domain.ChatMessage;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // cursorId 이후의 메시지 조회 (정방향)
    List<ChatMessage> findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(Long channelId, Long threadId, Pageable pageable);

    // 첫 요청 시 최신 메시지를 찾기 위한 쿼리
    Optional<ChatMessage> findTopByChannelIdOrderByThreadIdDesc(Long channelId);

    // 역방향 조회 (lastReadId 이하의 메시지)
    List<ChatMessage> findByChannelIdAndThreadIdLessThanEqualOrderByThreadIdDesc(Long channelId, Long threadId, Pageable pageable);
}