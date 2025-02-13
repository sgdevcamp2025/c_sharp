package com.jootalkpia.signaling_server.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.stereotype.Repository;
import java.util.Set;

@Repository
public class HuddleParticipantsRepository {
    private final SetOperations<String, Long> setOps;
    private final HashOperations<String, String, String> hashOps;
    private final RedisTemplate<String, Long> redisTemplate;
    private final UserHuddleRepository userHuddleRepository; // 추가

    public HuddleParticipantsRepository(
            @Qualifier("longRedisTemplate") RedisTemplate<String, Long> redisTemplate,
            @Qualifier("stringRedisTemplate") RedisTemplate<String, String> stringRedisTemplate,
            UserHuddleRepository userHuddleRepository) { // 추가
        this.setOps = redisTemplate.opsForSet();
        this.hashOps = stringRedisTemplate.opsForHash();
        this.redisTemplate = redisTemplate;
        this.userHuddleRepository = userHuddleRepository; // 추가
    }

    // 허들 참가자 추가 및 유저-허들 매핑 업데이트
    public void addParticipant(String huddleId, Long userId) {
        String key = "huddle:" + huddleId + ":participants";
        setOps.add(key, userId);
        userHuddleRepository.saveUserHuddle(userId, huddleId); // 유저-허들 매핑 저장
    }

    // 허들에서 참가자 제거 및 유저-허들 매핑 삭제
    public void removeParticipant(String huddleId, Long userId) {
        setOps.remove("huddle:" + huddleId + ":participants", userId);
        userHuddleRepository.removeUserHuddle(userId); // 유저-허들 매핑 삭제
        removeUserEndpoint(huddleId, userId);
    }

    // 허들 내 참가자 목록 조회
    public Set<Long> getParticipants(String huddleId) {
        return setOps.members("huddle:" + huddleId + ":participants");
    }

    // WebRTC 엔드포인트 정보 저장
    public void saveUserEndpoint(String huddleId, Long userId, String endpointId) {
        String key = "huddle:" + huddleId + ":endpoints";
        hashOps.put(key, userId.toString(), endpointId);
    }

    // WebRTC 엔드포인트 정보 조회
    public String getUserEndpoint(String huddleId, Long userId) {
        String key = "huddle:" + huddleId + ":endpoints";
        return hashOps.get(key, userId.toString());
    }

    // WebRTC 엔드포인트 삭제
    public void removeUserEndpoint(String huddleId, Long userId) {
        String key = "huddle:" + huddleId + ":endpoints";
        hashOps.delete(key, userId.toString());
    }
}
