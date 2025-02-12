package com.jootalkpia.signaling_server.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.signaling_server.rtc.KurentoRoom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
@Slf4j
public class KurentoRoomRepository {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final KurentoClient kurentoClient; // KurentoClient 추가 (MediaPipeline 복원용)

    // KurentoRoom을 Redis에 저장 (MediaPipeline 객체가 아닌 ID만 저장)
    public void saveRoom(String huddleId, KurentoRoom room) {
        try {
            // MediaPipeline을 직접 저장하지 않고 pipelineId만 저장
            String roomJson = objectMapper.writeValueAsString(new KurentoRoom(room.getHuddleId(), room.getPipelineId()));
            redisTemplate.opsForValue().set("huddle:" + huddleId + ":kurento", roomJson);
        } catch (JsonProcessingException e) {
            log.error("Redis 저장 오류: KurentoRoom 변환 실패", e);
        }
    }

    // Redis에서 KurentoRoom 가져오기 (pipelineId 기반으로 MediaPipeline 다시 불러오기)
    public KurentoRoom getRoom(String huddleId) {
        try {
            String roomJson = redisTemplate.opsForValue().get("huddle:" + huddleId + ":kurento");
            if (roomJson != null) {
                KurentoRoom tempRoom = objectMapper.readValue(roomJson, KurentoRoom.class);

                // pipelineId를 이용해서 MediaPipeline을 다시 가져옴
                MediaPipeline pipeline = kurentoClient.getById(tempRoom.getPipelineId(), MediaPipeline.class);

                if (pipeline == null) {
                    log.error("Kurento에서 pipelineId {} 를 찾을 수 없음", tempRoom.getPipelineId());
                    return null;
                }

                tempRoom.restorePipeline(pipeline); // pipeline 복원
                return tempRoom;
            }
        } catch (Exception e) {
            log.error("Redis 조회 오류: KurentoRoom 변환 실패", e);
        }
        return null;
    }

    // Redis에서 KurentoRoom 삭제
    public void deleteRoom(String huddleId) {
        redisTemplate.delete("huddle:" + huddleId + ":kurento");
    }
}
