package com.jootalkpia.signaling_server.rtc;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.ToNumberPolicy;
import com.jootalkpia.signaling_server.exception.common.CustomException;
import com.jootalkpia.signaling_server.exception.common.ErrorCode;
import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.repository.ChannelHuddleRepository;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.service.HuddleService;
import com.jootalkpia.signaling_server.service.KurentoService;
import com.jootalkpia.signaling_server.util.ValidationUtils;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.IceCandidate;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KurentoHandler extends TextWebSocketHandler {

    private final Gson gson = new GsonBuilder().setObjectToNumberStrategy(ToNumberPolicy.LONG_OR_DOUBLE).create();
    private final HuddleService huddleService;
    private final KurentoService kurentoService;
    private final ValidationUtils validationUtils;
    private final RedisTemplate<String, Long> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;


    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        Map<String, Object> json = gson.fromJson(message.getPayload(), Map.class);
        String id = (String) json.get("id");

        switch (id) {
            case "createRoom" -> handleCreateRoom(session, json);
            case "joinRoom" -> handleJoinRoom(session, json);
            case "leaveRoom" -> handleLeaveRoom(session, json);
            case "offer" -> handleOffer(session, json);
            case "iceCandidate" -> handleIceCandidate(session, json);
            default -> log.warn("Unknown message type received: {}", id);
        }
    }

    private Long getLongValueFromJson(Map<String, Object> json, String key) {
        Object value = json.get(key);
        if (value == null) {
            log.error("Missing required parameter: {}", key);
            throw new IllegalArgumentException("Missing required parameter: " + key);
        }
        return (value instanceof Number) ? ((Number) value).longValue() : Long.parseLong(value.toString());
    }

    // 허들 생성
    private void handleCreateRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long channelId = getLongValueFromJson(json, "channelId");
            Long userId = getLongValueFromJson(json, "userId");

            // TODO: ValidationUtils.validateUserId(),  ValidationUtils.validateChannelId()

            // 허들 메타데이터 저장
            Huddle newHuddle = huddleService.createHuddle(channelId, userId);

            // 채널과 허들 매핑
            huddleService.saveHuddleChannel(channelId, newHuddle.huddleId());

            // 파이프라인 생성 및 허들과 파이프라인 매핑
            kurentoService.createPipeline(newHuddle.huddleId());

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "roomCreated", "huddleId", newHuddle.huddleId()))));

//             일정 시간 내 참가 없으면 삭제
//            scheduleHuddleDeletion(newHuddle.huddleId());

            // 자동으로 허들 입장 처리
            handleJoinRoom(session, Map.of(
                    "id", "joinRoom",
                    "channelId", channelId,
                    "userId", userId
            ));
        } catch (Exception e) {
            log.error("Error creating room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to create room"))));
        }
    }

    private void scheduleHuddleDeletion(String huddleId) {

    }

    // 허들 입장 (새로운 참가자가 들어올 때 기존 참가자들에게 알림)
    private void handleJoinRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        Long userId = getLongValueFromJson(json, "userId");
        Long channelId = getLongValueFromJson(json, "channelId");

        // TODO: ValidationUtils.validateUserId(),  ValidationUtils.validateChannelId()

        try {
            String huddleId = validationUtils.isHuddleInChannel(channelId);
            if (huddleId == null) {
                throw new CustomException(ErrorCode.HUDDLE_NOT_FOUND.getCode(), "해당 채널에 매핑된 허들이 없습니다.");
            }

            validationUtils.canUserJoinHuddle(huddleId, userId);
            validationUtils.isHuddleValid(huddleId);
            validationUtils.isPipelineInChannel(huddleId);

            // WebRTC 엔드포인트 생성 및 저장
            WebRtcEndpoint newUserEndpoint = kurentoService.addParticipantToRoom(huddleId, userId);

            // 유저:허들 저장
            huddleService.addUserHuddle(userId, huddleId);

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "joinedRoom", "huddleId", huddleId))));

            // 새로운 참가자가 들어왔음을 기존 참가자들에게 알림
            notifyExistingParticipants(huddleId, userId, newUserEndpoint);

            // 새로운 참가자가 기존 참가자들의 스트림을 구독하도록 SDP Offer 전송 요청
            subscribeToExistingParticipants(huddleId, userId);

        } catch (Exception e) {
            log.error("Error joining room", e);

            // 오류 발생 시 롤백 처리
            huddleService.recoverIfErrorJoining(userId, channelId);

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to join room"))));
        }
    }

    // 새로운 참가자가 입장하면 기존 참가자들에게 구독하라고 SDP Offer 전송 요청
    private void notifyExistingParticipants(String huddleId, Long newUserId, WebRtcEndpoint newUserEndpoint) {
        Set<Long> participantIds = redisTemplate.opsForSet().members("huddle:" + huddleId + ":participants");

        for (Long participantId : participantIds) {
            if (!participantId.equals(newUserId)) {
                try {
                    WebRtcEndpoint existingEndpoint = kurentoService.getParticipantEndpoint(huddleId, participantId);
                    if (existingEndpoint != null) {
                        // 새로운 참가자가 기존 참가자에게 SDP Offer 요청
                        String sdpOffer = newUserEndpoint.generateOffer();

                        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/subscribe", gson.toJson(Map.of(
                                "id", "subscribe",
                                "huddleId", huddleId,
                                "newUserId", newUserId,
                                "targetUserId", participantId,  // 구독 대상 추가
                                "sdpOffer", sdpOffer
                        )));
                    }
                } catch (Exception e) {
                    log.error("Error notifying existing participant {} about new participant {}", participantId, newUserId, e);
                }
            }
        }
    }

    // 새로운 참가자가 기존 참가자들을 구독하도록 SDP Offer 전송 요청
    private void subscribeToExistingParticipants(String huddleId, Long newUserId) {
        Set<Long> participantIds = redisTemplate.opsForSet().members("huddle:" + huddleId + ":participants");

        for (Long participantId : participantIds) {
            if (!participantId.equals(newUserId)) {
                try {
                    WebRtcEndpoint newUserEndpoint = kurentoService.getParticipantEndpoint(huddleId, newUserId);
                    if (newUserEndpoint != null) {
                        String sdpOffer = newUserEndpoint.generateOffer();

                        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/subscribe", gson.toJson(Map.of(
                                "id", "subscribe",
                                "huddleId", huddleId,
                                "newUserId", newUserId,
                                "targetUserId", participantId,
                                "sdpOffer", sdpOffer
                        )));
                    }
                } catch (Exception e) {
                    log.error("Error notifying new participant {} about existing participant {}", newUserId, participantId, e);
                }
            }
        }
    }


    // 허들 나감
    private void handleLeaveRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");

            // Kurento에서 WebRTC 엔드포인트 삭제
            kurentoService.removeParticipantFromRoom(huddleId, userId);

            // 허들에서 유저 제거
            validationUtils.canUserExitHuddle(huddleId, userId);

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "leftRoom", "huddleId", huddleId))));
        } catch (Exception e) {
            log.error("Error leaving room", e);
        }
    }

    // SDP Offer 처리
    private void handleOffer(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");
            String sdpOffer = (String) json.get("sdpOffer");

            WebRtcEndpoint webRtcEndpoint = kurentoService.getParticipantEndpoint(huddleId, userId);

            // 허들에 참여 중이 아닌 경우 Offer 처리 안함
            if (webRtcEndpoint == null) {
                log.warn("엔드포인트가 널!! 허들에 참여 중이지 않은 유저입니다: userId={}", userId);
                return;
            }

            webRtcEndpoint.addIceCandidateFoundListener(event -> {
                IceCandidate candidate = event.getCandidate();
                sendIceCandidate(huddleId, userId, userId, candidate);
            });

            // offer 에 대한 answer 생성
            String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);

            // 쿠렌토가 후보를 찾는 과정
            webRtcEndpoint.gatherCandidates();

            session.sendMessage(new TextMessage(gson.toJson(Map.of(
                    "id", "answer",
                    "huddleId", huddleId,
                    "userId", userId,
                    "sdpAnswer", sdpAnswer
            ))));

        } catch (Exception e) {
            log.error("Error handling offer", e);
        }
    }

    // ICE Candidate 처리
    private void handleIceCandidate(WebSocketSession session, Map<String, Object> json) {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");
            Long targetUserId = getLongValueFromJson(json, "targetUserId");

            Object candidateObj = json.get("candidate");
            String candidate;
            String sdpMid = "";
            int sdpMLineIndex = 0;

            if (candidateObj instanceof String) {
                candidate = (String) candidateObj;
            } else if (candidateObj instanceof Map) {
                Map<String, Object> candidateMap = (Map<String, Object>) candidateObj;
                candidate = (String) candidateMap.get("candidate");
                sdpMid = (String) candidateMap.getOrDefault("sdpMid", "");
                sdpMLineIndex = ((Number) candidateMap.getOrDefault("sdpMLineIndex", 0)).intValue();
            } else {
                log.error("Invalid ICE Candidate format: {}", candidateObj);
                return;
            }

            WebRtcEndpoint targetEndpoint = kurentoService.getParticipantEndpoint(huddleId, targetUserId);
            if (targetEndpoint == null) {
                log.warn("Target user {} is not in huddle {}", targetUserId, huddleId);
                return;
            }

            targetEndpoint.addIceCandidate(new IceCandidate(candidate, sdpMid, sdpMLineIndex));

            // 상대방에게 ICE Candidate 전송
            sendIceCandidate(huddleId, targetUserId, userId, new IceCandidate(candidate, sdpMid, sdpMLineIndex));

        } catch (Exception e) {
            log.error("Error handling ICE candidate", e);
        }
    }

    // ICE Candidate 전송 공통 메서드
    private final Object webSocketLock = new Object(); // 동기화용 Lock 객체
    private void sendIceCandidate(String huddleId, Long targetUserId, Long senderId, IceCandidate candidate) {
        Map<String, Object> candidateJson = Map.of(
                "id", "iceCandidate",
                "huddleId", huddleId,
                "userId", targetUserId,
                "senderId", senderId,
                "candidate", Map.of(
                        "candidate", candidate.getCandidate(),
                        "sdpMid", candidate.getSdpMid(),
                        "sdpMLineIndex", candidate.getSdpMLineIndex()
                )
        );

        messagingTemplate.convertAndSend("/topic/huddle/" + huddleId + "/iceCandidate", gson.toJson(candidateJson));
        log.info("📡 Sent ICE candidate to user {} in huddle {}: {}", targetUserId, huddleId, candidateJson);
    }

}
