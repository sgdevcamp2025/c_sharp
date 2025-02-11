package com.jootalkpia.signaling_server.repository;

import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.stereotype.Repository;
import java.util.Set;

@Repository
public class HuddleParticipantsRepository {
    private final SetOperations<String, Long> setOps;
    private final HashOperations<String, String, String> hashOps;

    public HuddleParticipantsRepository(RedisTemplate<String, Long> redisTemplate, RedisTemplate<String, String> stringRedisTemplate) {
        this.setOps = redisTemplate.opsForSet();
        this.hashOps = stringRedisTemplate.opsForHash();
    }

    // 허들에 참가자 추가
    public void addParticipant(String huddleId, Long userId) {
        String key = "huddle:" + huddleId + ":participants";
        setOps.add(key, userId);
    }

    // 허들 내 참가자 목록 조회
    public Set<Long> getParticipants(String huddleId) {
        return setOps.members("huddle:" + huddleId + ":participants");
    }

    // 허들에서 참가자 제거
    public void removeParticipant(String huddleId, Long userId) {
        setOps.remove("huddle:" + huddleId + ":participants", userId);
        removeUserEndpoint(huddleId, userId);  // 엔드포인트 정보도 함께 삭제
    }

    // 🔹 **WebRTC 엔드포인트 정보 저장**
    public void saveUserEndpoint(String huddleId, Long userId, String endpointId) {
        String key = "huddle:" + huddleId + ":endpoints";
        hashOps.put(key, userId.toString(), endpointId);
    }

    // 🔹 **WebRTC 엔드포인트 정보 조회**
    public String getUserEndpoint(String huddleId, Long userId) {
        String key = "huddle:" + huddleId + ":endpoints";
        return hashOps.get(key, userId.toString());
    }

    // 🔹 **WebRTC 엔드포인트 삭제**
    public void removeUserEndpoint(String huddleId, Long userId) {
        String key = "huddle:" + huddleId + ":endpoints";
        hashOps.delete(key, userId.toString());
    }
}
