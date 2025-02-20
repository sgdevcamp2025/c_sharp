package com.jootalkpia.signaling_server.rtc;

import com.jootalkpia.signaling_server.exception.common.CustomException;
import com.jootalkpia.signaling_server.exception.common.ErrorCode;
import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.service.HuddleService;
import com.jootalkpia.signaling_server.service.KurentoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.IceCandidate;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.Set;

@Slf4j
@Controller
@RequiredArgsConstructor
public class KurentoHandler {

    private final HuddleService huddleService;
    private final KurentoService kurentoService;
    private final RedisTemplate<String, Long> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ValidationUtils validationUtils;


    @MessageMapping("/createRoom")
    @SendTo("/topic/roomCreated")
    public Map<String, Object> handleCreateRoom(@Payload Map<String, Object> json) {
        log.info(" 방 생성 요청: {}", json);
        try {
            Long channelId = getLongValueFromJson(json, "channelId");
            Long userId = getLongValueFromJson(json, "userId");

            Huddle newHuddle = huddleService.createHuddle(channelId, userId);
            huddleService.saveHuddleChannel(channelId, newHuddle.huddleId());
            kurentoService.createPipeline(newHuddle.huddleId());

            return Map.of("id", "roomCreated", "huddleId", newHuddle.huddleId());
        } catch (Exception e) {
            log.error("방 생성 실패", e);
            return Map.of("id", "error", "message", "Failed to create room");
        }
    }
    
    
    @MessageMapping("/joinRoom")
    public void handleJoinRoom(@Payload Map<String, Object> json) {
        Long userId = getLongValueFromJson(json, "userId");
        Long channelId = getLongValueFromJson(json, "channelId");
        String huddleId = json.get("huddleId").toString();

        try {
            huddleId = validationUtils.isHuddleInChannel(channelId);
            if (huddleId == null) {
                throw new CustomException(ErrorCode.HUDDLE_NOT_FOUND.getCode(), "해당 채널에 매핑된 허들이 없습니다.");
            }

            validationUtils.canUserJoinHuddle(huddleId, userId);
            validationUtils.isHuddleValid(huddleId);
            validationUtils.isPipelineInChannel(huddleId);

            // 새로운 참가자의 WebRtcEndpoint 생성
            WebRtcEndpoint newUserEndpoint = kurentoService.addParticipantToRoom(huddleId, userId);

            // ICE Candidate 강제 수집
            newUserEndpoint.gatherCandidates();

            log.info("방 참가 응답 보내기: huddleId={}, userId={}", huddleId, userId);
            messagingTemplate.convertAndSend("/topic/" + huddleId + "/joinedRoom",
                    Map.of("id", "joinedRoom", "huddleId", huddleId, "userId", userId));

        } catch (Exception e) {
            log.error(" 방 참가 실패", e);
            messagingTemplate.convertAndSend("/topic/error",
                    Map.of("id", "error", "message", "Failed to join room"));
        }
    }


    @MessageMapping("/sdpOffer")
    public void handleOffer(@Payload Map<String, Object> json) {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = json.get("huddleId").toString();
            String sdpOffer = json.get("sdpOffer").toString();

            WebRtcEndpoint userEndpoint = kurentoService.getParticipantEndpoint(huddleId, userId);
            if (userEndpoint == null) {
                log.warn(" WebRtcEndpoint 없음! userId={}, huddleId={}", userId, huddleId);
                return;
            }

            String mySdpAnswer = userEndpoint.processOffer(sdpOffer);
            userEndpoint.gatherCandidates(); // ICE Candidate 수집 시작
            log.info("📡 ICE Candidate 수집 시작됨: userId={}", userId);

            userEndpoint.addIceCandidateFoundListener(event -> {
                IceCandidate candidate = event.getCandidate();
                log.info("📡 ICE Candidate 감지됨: userId={}, candidate={}", userId, candidate.getCandidate());

                // ICE Candidate 메시지를 클라이언트에 전달
                messagingTemplate.convertAndSend("/topic/" + huddleId + "/iceCandidate",
                        Map.of("id", "iceCandidate", "huddleId", huddleId, "userId", userId, "candidate",
                                Map.of("candidate", candidate.getCandidate(), "sdpMid", candidate.getSdpMid(), "sdpMLineIndex", candidate.getSdpMLineIndex())));
            });

            // 클라이언트에게 SDP Answer 전송
            messagingTemplate.convertAndSend("/topic/" + huddleId + "/sdpAnswer",
                    Map.of("id", "sdpAnswer", "huddleId", huddleId, "userId", userId, "sdpAnswer", mySdpAnswer));

            // 기존 참가자들과 연결
            Set<Long> participantIds = redisTemplate.opsForSet().members("huddle:" + huddleId + ":participants");
            for (Long participantId : participantIds) {
                if (!participantId.equals(userId)) {
                    WebRtcEndpoint existingEndpoint = kurentoService.getParticipantEndpoint(huddleId, participantId);
                    if (existingEndpoint != null) {
                        existingEndpoint.connect(userEndpoint);
                        userEndpoint.connect(existingEndpoint);
                        log.info(" SFU: {} 와 {} 연결 완료 (Kurento)", userId, participantId);
                    }
                }
            }

        } catch (Exception e) {
            log.error("SDP Offer 처리 실패", e);
        }
    }

    
    @MessageMapping("/iceCandidate")
    public void handleIceCandidate(@Payload Map<String, Object> json) {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = json.get("huddleId").toString();
            String candidate = json.get("candidate").toString();
            String sdpMid = json.getOrDefault("sdpMid", "").toString();
            int sdpMLineIndex = ((Number) json.getOrDefault("sdpMLineIndex", 0)).intValue();

            WebRtcEndpoint userEndpoint = kurentoService.getParticipantEndpoint(huddleId, userId);
            if (userEndpoint != null) {
                userEndpoint.addIceCandidate(new IceCandidate(candidate, sdpMid, sdpMLineIndex));
                log.info("ICE Candidate 추가됨: userId={}, candidate={}", userId, candidate);
            } else {
                log.warn("ICE Candidate 추가 실패: WebRtcEndpoint 없음 (userId={})", userId);
            }

            // ICE Candidate를 모든 참가자에게 전송
            messagingTemplate.convertAndSend("/topic/" + huddleId + "/iceCandidate",
                    Map.of("id", "iceCandidate", "huddleId", huddleId, "userId", userId, "candidate",
                            Map.of("candidate", candidate, "sdpMid", sdpMid, "sdpMLineIndex", sdpMLineIndex)));

        } catch (Exception e) {
            log.error(" ICE Candidate 처리 실패", e);
        }
    }




    private Long getLongValueFromJson(Map<String, Object> json, String key) {
        Object value = json.get(key);
        if (value == null) {
            log.error(" 필수 파라미터 누락: {}", key);
            throw new IllegalArgumentException("Missing required parameter: " + key);
        }
        return (value instanceof Number) ? ((Number) value).longValue() : Long.parseLong(value.toString());
    }
}








//package com.jootalkpia.signaling_server.rtc;
//
//import com.google.gson.Gson;
//import com.google.gson.GsonBuilder;
//import com.google.gson.ToNumberPolicy;
//import com.jootalkpia.signaling_server.exception.common.CustomException;
//import com.jootalkpia.signaling_server.exception.common.ErrorCode;
//import com.jootalkpia.signaling_server.model.Huddle;
//import com.jootalkpia.signaling_server.service.HuddleService;
//import com.jootalkpia.signaling_server.service.KurentoService;
//import java.util.Set;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.kurento.client.IceCandidate;
//import org.kurento.client.WebRtcEndpoint;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.Payload;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Component;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.socket.*;
//import org.springframework.web.socket.handler.TextWebSocketHandler;
//
//import java.io.IOException;
//import java.util.Map;
//
//@Slf4j
//@Controller
//@RequiredArgsConstructor
//public class KurentoHandler {
//
//    private final Gson gson = new GsonBuilder().setObjectToNumberStrategy(ToNumberPolicy.LONG_OR_DOUBLE).create();
//    private final HuddleService huddleService;
//    private final KurentoService kurentoService;
//    private final RedisTemplate<String, Long> redisTemplate;
//    private final SimpMessagingTemplate messagingTemplate;
//    private final ValidationUtils validationUtils;
//
//    @MessageMapping("/createRoom")
//    @SendTo("/topic/roomCreated")
//    public Map<String, Object> handleCreateRoom(@Payload Map<String, Object> json) {
//        log.info("handleCreateRoom");
//        try {
//            Long channelId = getLongValueFromJson(json, "channelId");
//            Long userId = getLongValueFromJson(json, "userId");
//
////            validationUtils.validateUserId(userId);
////            validationUtils.validateChannelId(channelId);
//
//            Huddle newHuddle = huddleService.createHuddle(channelId, userId);
//            huddleService.saveHuddleChannel(channelId, newHuddle.huddleId());
//            kurentoService.createPipeline(newHuddle.huddleId());
//
//            return Map.of("id", "roomCreated", "huddleId", newHuddle.huddleId());
//        } catch (Exception e) {
//            log.error("Error creating room", e);
//            return Map.of("id", "error", "message", "Failed to create room");
//        }
//    }
//
////    @MessageMapping("/sdpAnswer")
////    public void handleSdpAnswer(@Payload Map<String, Object> json) {
////        log.info("📡 SDP Answer 수신: {}", json);
////        try {
////            Long userId = getLongValueFromJson(json, "userId");
////            String huddleId = json.get("huddleId").toString();
////            String sdpAnswer = json.get("sdpAnswer").toString();
////            Long targetUserId = getLongValueFromJson(json, "targetUserId");
////
////            WebRtcEndpoint targetEndpoint = kurentoService.getParticipantEndpoint(huddleId, targetUserId);
////            if (targetEndpoint != null) {
////                targetEndpoint.processAnswer(sdpAnswer);
////            }
////        } catch (Exception e) {
////            log.error("🚨 Error processing SDP Answer", e);
////        }
////    }
//
//
//    @MessageMapping("/sdpOffer")
////    @SendTo("/topic/{huddleId}/sdpAnswer")
//    public void handleOffer(@Payload Map<String, Object> json) {
//        log.info("handleOffer");
//        try {
//            Long userId = getLongValueFromJson(json, "userId");
//            String huddleId = json.get("huddleId").toString();
//            String sdpOffer = json.get("sdpOffer").toString();
//
//            WebRtcEndpoint webRtcEndpoint = kurentoService.getParticipantEndpoint(huddleId, userId);
//
////            // 허들에 참여 중이 아닌 경우 Offer 처리 안함
////            if (webRtcEndpoint == null) {
////                log.warn("엔드포인트가 널!! 허들에 참여 중이지 않은 유저입니다: userId={}", userId);
////                messagingTemplate.convertAndSend("/topic/error",
////                        Map.of("id", "error", "message", "Failed handling sdp offer"));
////            }
//
//            webRtcEndpoint.addIceCandidateFoundListener(event -> {
//                IceCandidate candidate = event.getCandidate();
//                sendIceCandidate(huddleId, userId, userId, candidate);
//            });
//
//            String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
//            webRtcEndpoint.gatherCandidates();
//
//            messagingTemplate.convertAndSend("/topic/" + huddleId + "/sdpAnswer",
//                    Map.of("id", "sdpAnswer", "huddleId", huddleId, "userId", userId, "sdpAnswer", sdpAnswer));
//
//
//        } catch (Exception e) {
//            log.error("Error handling SDP offer", e);
//            messagingTemplate.convertAndSend("/topic/error",
//                    Map.of("id", "error", "message", "Failed handling sdp offer"));
//        }
//
//    }
//
//    @MessageMapping("/iceCandidate")
//    public void handleIceCandidate(@Payload Map<String, Object> json) {
//        log.info("handleIceCandidate");
//        try {
//            Long userId = getLongValueFromJson(json, "userId");
//            String huddleId = json.get("huddleId").toString();
//            Long targetUserId = getLongValueFromJson(json, "targetUserId");
//
//            String candidate = json.get("candidate").toString();
//            String sdpMid = json.getOrDefault("sdpMid", "").toString();
//            int sdpMLineIndex = ((Number) json.getOrDefault("sdpMLineIndex", 0)).intValue();
//
//            WebRtcEndpoint targetEndpoint = kurentoService.getParticipantEndpoint(huddleId, targetUserId);
//            if (targetEndpoint != null) {
//                targetEndpoint.addIceCandidate(new IceCandidate(candidate, sdpMid, sdpMLineIndex));
//                messagingTemplate.convertAndSend("/topic/" + huddleId + "/iceCandidate",
//                        Map.of("id", "iceCandidate", "huddleId", huddleId, "userId", targetUserId, "candidate",
//                                Map.of("candidate", candidate, "sdpMid", sdpMid, "sdpMLineIndex", sdpMLineIndex)));
//            }
//        } catch (Exception e) {
//            log.error("Error handling ICE candidate", e);
//            messagingTemplate.convertAndSend("/topic/error",
//                    Map.of("id", "error", "message", "Failed handling ice candidate"));
//        }
//    }
//
//    @MessageMapping("/joinRoom")
//    public void handleJoinRoom(@Payload Map<String, Object> json) {
//        Long userId = getLongValueFromJson(json, "userId");
//        Long channelId = getLongValueFromJson(json, "channelId");
//
//        try {
//            String huddleId = validationUtils.isHuddleInChannel(channelId);
//            if (huddleId == null) {
//                throw new CustomException(ErrorCode.HUDDLE_NOT_FOUND.getCode(), "해당 채널에 매핑된 허들이 없습니다.");
//            }
//
//            validationUtils.canUserJoinHuddle(huddleId, userId);
//            validationUtils.isHuddleValid(huddleId);
//            validationUtils.isPipelineInChannel(huddleId);
//
//            // ✅ 새로운 참가자의 WebRtcEndpoint 생성
//            WebRtcEndpoint newUserEndpoint = kurentoService.addParticipantToRoom(huddleId, userId);
//
//            // 참가 성공 메시지 전송
//            messagingTemplate.convertAndSend("/topic/" + huddleId + "/joinedRoom",
//                    Map.of("id", "joinedRoom", "huddleId", huddleId, "userId", userId));
//
//        } catch (Exception e) {
//            log.error("Error joining room", e);
//            messagingTemplate.convertAndSend("/topic/error",
//                    Map.of("id", "error", "message", "Failed to join room"));
//        }
//    }
//
//    /**
//     * 기존 참가자의 WebRTC Endpoint를 새로운 참가자가 구독하도록 SDP Offer 요청
//     */
//    private void subscribeToExistingParticipants(String huddleId, Long newUserId, WebRtcEndpoint newUserEndpoint) {
//        Set<Long> participantIds = redisTemplate.opsForSet().members("huddle:" + huddleId + ":participants");
//
//        for (Long participantId : participantIds) {
//            if (!participantId.equals(newUserId)) {
//                try {
//                    WebRtcEndpoint existingUserEndpoint = kurentoService.getParticipantEndpoint(huddleId, participantId);
//
//                    if (existingUserEndpoint != null) {
//                        // ✅ 기존 참가자의 SDP Offer를 생성하여 새로운 참가자에게 전송
//
//                        newUserEndpoint.generateOffer();
//
//                        String existingUserSdpOffer = existingUserEndpoint.processOffer("");
//                        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/subscribe",
//                                gson.toJson(Map.of(
//                                        "id", "subscribe",
//                                        "huddleId", huddleId,
//                                        "newUserId", newUserId,
//                                        "targetUserId", participantId,
//                                        "sdpOffer", existingUserSdpOffer
//                                )));
//
//                        // ✅ 새로운 참가자의 SDP Offer를 기존 참가자에게 전송
//                        String newUserSdpOffer = newUserEndpoint.processOffer("");
//                        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/subscribe",
//                                gson.toJson(Map.of(
//                                        "id", "subscribe",
//                                        "huddleId", huddleId,
//                                        "newUserId", participantId,
//                                        "targetUserId", newUserId,
//                                        "sdpOffer", newUserSdpOffer
//                                )));
//
//                        // ✅ 직접 WebRTC Endpoint 연결
//                        existingUserEndpoint.connect(newUserEndpoint);
//                        newUserEndpoint.connect(existingUserEndpoint);
//                    }
//                } catch (Exception e) {
//                    log.error("🚨 Error connecting new participant {} with existing participant {}", newUserId, participantId, e);
//                }
//            }
//        }
//    }
//
//
//    private Long getLongValueFromJson(Map<String, Object> json, String key) {
//        Object value = json.get(key);
//        if (value == null) {
//            log.error("Missing required parameter: {}", key);
//            throw new IllegalArgumentException("Missing required parameter: " + key);
//        }
//        return (value instanceof Number) ? ((Number) value).longValue() : Long.parseLong(value.toString());
//    }
//
//
//
//
//    // 새로운 참가자가 기존 참가자를 구독하도록 SDP Offer 요청
//    private void subscribeToExistingParticipants(String huddleId, Long newUserId) {
//        Set<Long> participantIds = redisTemplate.opsForSet().members("huddle:" + huddleId + ":participants");
//
//        for (Long participantId : participantIds) {
//            if (!participantId.equals(newUserId)) {
//                try {
//                    WebRtcEndpoint newUserEndpoint = kurentoService.getParticipantEndpoint(huddleId, newUserId);
//                    WebRtcEndpoint existingUserEndpoint = kurentoService.getParticipantEndpoint(huddleId, participantId);
//
//                    if (newUserEndpoint != null && existingUserEndpoint != null) {
//                        // 🔥 기존 참가자가 새로운 참가자를 인식할 수 있도록 SDP Offer 강제 전송
//                        String existingUserSdpOffer = existingUserEndpoint.generateOffer();
//                        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/subscribe", gson.toJson(Map.of(
//                                "id", "subscribe",
//                                "huddleId", huddleId,
//                                "newUserId", newUserId,
//                                "targetUserId", participantId,
//                                "sdpOffer", existingUserSdpOffer
//                        )));
//
//                        // 🔥 새로운 참가자도 기존 참가자를 인식할 수 있도록 SDP Offer 전송
//                        String newUserSdpOffer = newUserEndpoint.generateOffer();
//                        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/subscribe", gson.toJson(Map.of(
//                                "id", "subscribe",
//                                "huddleId", huddleId,
//                                "newUserId", participantId,
//                                "targetUserId", newUserId,
//                                "sdpOffer", newUserSdpOffer
//                        )));
//                    }
//                } catch (Exception e) {
//                    log.error("🚨 Error notifying participant {} about new participant {}", participantId, newUserId, e);
//                }
//            }
//        }
//    }
//
//
//
//    // 허들 나감
//    @MessageMapping("/leaveRoom")
//    public void handleLeaveRoom(@Payload Map<String, Object> json) {
//        log.info("Received leave room request");
//        try {
//            Long userId = getLongValueFromJson(json, "userId");
//            String huddleId = json.get("huddleId").toString();
//
//            validationUtils.canUserExitHuddle(huddleId, userId);
//            kurentoService.removeParticipantFromRoom(huddleId, userId);
//
//            messagingTemplate.convertAndSend("/topic/" + huddleId + "/leftRoom",
//                    Map.of("id", "leftRoom", "huddleId", huddleId, "userId", userId));
//        } catch (Exception e) {
//            log.error("Error leaving room", e);
//            messagingTemplate.convertAndSend("/topic/error",
//                    Map.of("id", "error", "message", "Failed to leave room"));
//        }
//    }
//
//
//
//    // ICE Candidate 전송 공통 메서드
//    private final Object webSocketLock = new Object(); // 동기화용 Lock 객체
//    private void sendIceCandidate(String huddleId, Long targetUserId, Long senderId, IceCandidate candidate) {
//        Map<String, Object> candidateJson = Map.of(
//                "id", "iceCandidate",
//                "huddleId", huddleId,
//                "userId", targetUserId,
//                "senderId", senderId,
//                "candidate", Map.of(
//                        "candidate", candidate.getCandidate(),
//                        "sdpMid", candidate.getSdpMid(),
//                        "sdpMLineIndex", candidate.getSdpMLineIndex()
//                )
//        );
//
//        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/iceCandidate", gson.toJson(candidateJson));
//        log.info("📡 Sent ICE candidate to user {} in huddle {}: {}", targetUserId, huddleId, candidateJson);
//    }
//
//}
