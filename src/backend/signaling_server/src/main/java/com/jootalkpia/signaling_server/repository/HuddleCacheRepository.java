//package com.jootalkpia.signaling_server.repository;
//
//import com.jootalkpia.signaling_server.model.Huddle;
//import org.springframework.data.redis.core.HashOperations;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Repository;
//import java.util.Map;
//
//@Repository
//public class HuddleCacheRepository {
//    private final HashOperations<String, String, String> hashOps;
//
//    public HuddleCacheRepository(RedisTemplate<String, String> redisTemplate) {
//        this.hashOps = redisTemplate.opsForHash();
//    }
//
//    public void saveHuddle(Huddle huddle) {
//        String key = "huddle:" + huddle.huddleId();
//        hashOps.put(key, "huddleId", huddle.huddleId());
//        hashOps.put(key, "channelId", huddle.channelId().toString());
//        hashOps.put(key, "createdByUserId", huddle.createdByUserId().toString());
//        hashOps.put(key, "createdAt", huddle.createdAt().toString());
//    }
//
//    public Huddle getHuddleById(String huddleId) {
//        String key = "huddle:" + huddleId;
//        Map<String, String> huddleData = hashOps.entries(key);
//        if (huddleData.isEmpty()) {
//            return null;
//        }
//
//        return new Huddle(
//                huddleData.get("huddleId"),
//                Long.parseLong(huddleData.get("channelId")),
//                Long.parseLong(huddleData.get("createdByUserId"))
//        );
//    }
//
//    public void deleteHuddle(String huddleId) {
//        hashOps.getOperations().delete("huddle:" + huddleId);
//    }
//}
