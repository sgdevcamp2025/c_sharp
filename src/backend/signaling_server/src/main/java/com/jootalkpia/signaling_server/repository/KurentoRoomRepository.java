package com.jootalkpia.signaling_server.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.signaling_server.rtc.KurentoRoom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
@Slf4j
public class KurentoRoomRepository {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper; // JSON 변환을 위한 ObjectMapper

    // 🚀 KurentoRoom을 Redis에 저장
    public void saveRoom(String huddleId, KurentoRoom room) {
        try {
            String roomJson = objectMapper.writeValueAsString(room);
            redisTemplate.opsForValue().set("huddle:" + huddleId + ":kurento", roomJson);
        } catch (JsonProcessingException e) {
            log.error("Redis 저장 오류: KurentoRoom 변환 실패", e);
        }
    }

    // 🚀 Redis에서 KurentoRoom 가져오기
    public KurentoRoom getRoom(String huddleId) {
        try {
            String roomJson = redisTemplate.opsForValue().get("huddle:" + huddleId + ":kurento");
            if (roomJson != null) {
                return objectMapper.readValue(roomJson, KurentoRoom.class);
            }
        } catch (JsonProcessingException e) {
            log.error("Redis 조회 오류: KurentoRoom 변환 실패", e);
        }
        return null;
    }

    // 🚀 Redis에서 KurentoRoom 삭제
    public void deleteRoom(String huddleId) {
        redisTemplate.delete("huddle:" + huddleId + ":kurento");
    }
}

