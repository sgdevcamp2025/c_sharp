//package com.jootalkpia.signaling_server.repository;
//
//import com.jootalkpia.signaling_server.exception.common.CustomException;
//import com.jootalkpia.signaling_server.exception.common.ErrorCode;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.kurento.client.KurentoClient;
//import org.kurento.client.MediaPipeline;
//import org.springframework.data.redis.core.StringRedisTemplate;
//import org.springframework.stereotype.Repository;
//
//import java.util.Set;
//
//@Repository
//@RequiredArgsConstructor
//@Slf4j
//public class HuddlePipelineRepository {
//
//    private final StringRedisTemplate redisTemplate;
//    private final KurentoClient kurentoClient;
//    private final UserHuddleRepository userHuddleRepository;
//
//    // HuddleId와 pipelineId 매핑을 Redis에 저장
//    public void saveHuddlePipeline(String huddleId, String pipelineId) {
//        try {
//            String key = "huddle:" + huddleId + ":pipeline";
//            redisTemplate.opsForValue().set(key, pipelineId);
//
//            log.info("허들 파이프라인 저장 완료: huddleId={}, pipelineId={}", huddleId, pipelineId);
//        } catch (Exception e) {
//            log.error("Redis 저장 오류: Huddle-Pipeline 매핑 저장 실패", e);
//        }
//    }
//
//    // Redis에서 HuddlePipeline 가져와서 MediaPipeline 복원
//    public MediaPipeline getPipeline(String huddleId) {
//        try {
//            String pipelineId = getPipelineId(huddleId);
//
//            // pipelineId를 이용해서 MediaPipeline을 다시 가져옴
//            return kurentoClient.getById(pipelineId, MediaPipeline.class);
//        } catch (Exception e) {
//            return null;
//        }
//    }
//
//    public String getPipelineId(String huddleId) {
////        try {
//            String key = "huddle:" + huddleId + ":pipeline";
//            String pipelineId = redisTemplate.opsForValue().get(key);
//            if (pipelineId == null) {
//                log.warn("해당 huddleId={}에 대한 pipelineId 없음", huddleId);
////                throw new CustomException(ErrorCode.PIPELINE_NOT_FOUND.getCode(), ErrorCode.PIPELINE_NOT_FOUND.getMsg());
//            }
//            return pipelineId;
////        } catch (Exception e) {
////            throw new CustomException(ErrorCode.PIPELINE_NOT_FOUND.getCode(), ErrorCode.PIPELINE_NOT_FOUND.getMsg());
////        }
//    }
//
//    // 허들 삭제 (Redis에서 pipeline 매핑 제거)
//    public void deleteHuddlePipeline(String huddleId) {
//        try {
//            String key = "huddle:" + huddleId + ":pipeline";
//            redisTemplate.delete(key);
//            log.info("허들 삭제 완료: huddleId={}", huddleId);
//        } catch (Exception e) {
//            log.error("Redis 삭제 오류: Huddle-Pipeline 삭제 실패", e);
//        }
//    }
//}
