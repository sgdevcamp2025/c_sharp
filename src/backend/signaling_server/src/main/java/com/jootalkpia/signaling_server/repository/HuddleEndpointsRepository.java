package com.jootalkpia.signaling_server.repository;

import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import java.util.Map;

@Repository
public class HuddleEndpointsRepository {
    private final HashOperations<String, String, String> hashOps;

    public HuddleEndpointsRepository(RedisTemplate<String, String> redisTemplate) {
        this.hashOps = redisTemplate.opsForHash();
    }

    public void addEndpoint(String huddleId, Long userId, String endpoint) {
        hashOps.put("huddle:" + huddleId + ":endpoints", userId.toString(), endpoint);
    }

    public String getEndpoint(String huddleId, Long userId) {
        return hashOps.get("huddle:" + huddleId + ":endpoints", userId.toString());
    }

    public void removeEndpoint(String huddleId, Long userId) {
        hashOps.delete("huddle:" + huddleId + ":endpoints", userId.toString());
    }
}

