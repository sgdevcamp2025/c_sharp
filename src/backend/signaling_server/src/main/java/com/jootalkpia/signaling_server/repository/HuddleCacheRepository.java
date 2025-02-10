package com.jootalkpia.signaling_server.repository;

import com.jootalkpia.signaling_server.model.Huddle;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import java.util.concurrent.TimeUnit;

@Repository
@RequiredArgsConstructor
public class HuddleCacheRepository {

    private final RedisTemplate<String, Huddle> huddleRedisTemplate;
    private final RedisTemplate<String, String> stringRedisTemplate;

    private static final String HUDDLE_PREFIX = "huddle:";
    private static final String CHANNEL_TO_HUDDLE_PREFIX = "channel-to-huddle:";

    // 허들 저장 (TTL 1시간 설정)
    public void saveHuddle(Huddle huddle) {
        String huddleKey = HUDDLE_PREFIX + huddle.huddleId();
        String channelKey = CHANNEL_TO_HUDDLE_PREFIX + huddle.channelId();

        // 허들 정보 저장
        huddleRedisTemplate.opsForValue().set(huddleKey, huddle);
        huddleRedisTemplate.expire(huddleKey, 1, TimeUnit.HOURS);

        // 채널 ID -> 허들 ID 매핑 저장
        stringRedisTemplate.opsForValue().set(channelKey, huddle.huddleId());
        stringRedisTemplate.expire(channelKey, 1, TimeUnit.HOURS);
    }

    // 허들 ID로 조회
    public Huddle getHuddleById(String huddleId) {
        return huddleRedisTemplate.opsForValue().get(HUDDLE_PREFIX + huddleId);
    }

    // 채널 ID로 허들 조회
    public Huddle getHuddleByChannel(Long channelId) {
        String huddleId = stringRedisTemplate.opsForValue().get(CHANNEL_TO_HUDDLE_PREFIX + channelId);
        return huddleId != null ? getHuddleById(huddleId) : null;
    }

    // 허들 삭제
    public void deleteHuddle(String huddleId) {
        Huddle huddle = getHuddleById(huddleId);
        if (huddle != null) {
            huddleRedisTemplate.delete(HUDDLE_PREFIX + huddleId);
            stringRedisTemplate.delete(CHANNEL_TO_HUDDLE_PREFIX + huddle.channelId());
        }
    }
}