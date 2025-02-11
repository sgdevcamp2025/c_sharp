package com.jootalkpia.signaling_server.repository;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.data.redis.core.HashOperations;

@Repository
public class UserHuddleRepository {
    private final HashOperations<String, String, String> hashOps;

    public UserHuddleRepository(RedisTemplate<String, String> redisTemplate) {
        this.hashOps = redisTemplate.opsForHash();
    }

    public void saveUserHuddle(Long userId, String huddleId, String endpoint) {
        String key = "user:" + userId;
        hashOps.put(key, "huddleId", huddleId);
        hashOps.put(key, "endpoint", endpoint);
    }

    public String getUserHuddle(Long userId) {
        return hashOps.get("user:" + userId, "huddleId");
    }

    public void deleteUserHuddle(Long userId) {
        redisTemplate.delete("user:" + userId);
    }
}
