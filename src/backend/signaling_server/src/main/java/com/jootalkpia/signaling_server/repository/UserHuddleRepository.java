//package com.jootalkpia.signaling_server.repository;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.redis.core.StringRedisTemplate;
//import org.springframework.data.redis.core.ValueOperations;
//import org.springframework.stereotype.Repository;
//
//@Repository
//public class UserHuddleRepository {
//    private final ValueOperations<String, String> valueOps;
//
//    public UserHuddleRepository(StringRedisTemplate redisTemplate) {
//        this.valueOps = redisTemplate.opsForValue();
//    }
//
//    private String getUserHuddleKey(Long userId) {
//        return "huddle:user:" + userId;
//    }
//
//    // 유저의 현재 허들 저장
//    public void saveUserHuddle(Long userId, String huddleId) {
//        valueOps.set(getUserHuddleKey(userId), huddleId);
//    }
//
//    // 유저의 현재 허들 조회
//    public String getUserHuddle(Long userId) {
//        return valueOps.get(getUserHuddleKey(userId));
//    }
//
//    // 유저의 허들 삭제 (퇴장 처리)
//    public void removeUserHuddle(Long userId) {
//        valueOps.getAndDelete(getUserHuddleKey(userId));
//    }
//}
