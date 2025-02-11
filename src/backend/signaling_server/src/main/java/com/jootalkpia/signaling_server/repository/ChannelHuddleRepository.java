package com.jootalkpia.signaling_server.repository;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.data.redis.core.ValueOperations;

@Repository
public class ChannelHuddleRepository {
    private final ValueOperations<String, String> valueOps;

    public ChannelHuddleRepository(RedisTemplate<String, String> redisTemplate) {
        this.valueOps = redisTemplate.opsForValue();
    }

    public void saveChannelHuddle(Long channelId, String huddleId) {
        valueOps.set("channel:" + channelId, huddleId);
    }

    public String getHuddleByChannel(Long channelId) {
        return valueOps.get("channel:" + channelId);
    }

    public void deleteChannelHuddle(Long channelId) {
        redisTemplate.delete("channel:" + channelId);
    }
}

