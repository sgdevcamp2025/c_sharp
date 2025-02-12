package com.jootalkpia.signaling_server.rtc;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.ToNumberPolicy;
import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.service.HuddleService;
import com.jootalkpia.signaling_server.service.KurentoManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.IceCandidate;
import org.kurento.client.WebRtcEndpoint;
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
    private final HuddleParticipantsRepository huddleParticipantsRepository;
    private final KurentoManager kurentoManager;

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

            // 허들 메타데이터 생성
            Huddle newHuddle = huddleService.createHuddle(channelId, userId);

            // KurentoRoom 생성 및 저장
            kurentoManager.createRoom(newHuddle.huddleId());

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "roomCreated", "huddleId", newHuddle.huddleId()))));

            // 자동으로 허들 입장 처리
            handleJoinRoom(session, Map.of(
                    "id", "joinRoom",
                    "huddleId", newHuddle.huddleId(),
                    "userId", userId
            ));
        } catch (Exception e) {
            log.error("Error creating room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to create room"))));
        }
    }

    // 허들 입장
    private void handleJoinRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");

            huddleService.joinHuddle(huddleId, userId);

            // WebRTC 엔드포인트 생성 및 저장
            WebRtcEndpoint webRtcEndpoint = kurentoManager.addParticipantToRoom(huddleId, userId);

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "joinedRoom", "huddleId", huddleId))));
        } catch (Exception e) {
            log.error("Error joining room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to join room"))));
        }
    }

    // 허들 나감
    private void handleLeaveRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");

            // Kurento에서 WebRTC 엔드포인트 삭제
            kurentoManager.removeParticipantFromRoom(huddleId, userId);

            // 허들에서 유저 제거
            huddleService.exitHuddle(huddleId, userId);

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

            WebRtcEndpoint webRtcEndpoint = kurentoManager.getParticipantEndpoint(huddleId, userId);

            // 허들에 참여 중이 아닌 경우 Offer 처리 안함
            if (webRtcEndpoint == null) {
                log.warn("허들에 참여 중이지 않은 유저입니다: userId={}", userId);
                return;
            }

            webRtcEndpoint.addIceCandidateFoundListener(event -> {
                IceCandidate candidate = event.getCandidate();
                sendIceCandidate(session, candidate);
            });

            String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
            webRtcEndpoint.gatherCandidates();
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "answer", "sdpAnswer", sdpAnswer))));
        } catch (Exception e) {
            log.error("Error handling offer", e);
        }
    }

    // ICE Candidate 처리
    private void handleIceCandidate(WebSocketSession session, Map<String, Object> json) {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");

            // 🔥 `candidate` 필드가 `LinkedTreeMap` 형태로 들어올 가능성 있음
            Object candidateObj = json.get("candidate");

            String candidate;
            String sdpMid = "";
            int sdpMLineIndex = 0;

            if (candidateObj instanceof String) {
                // ✅ String 타입이면 그대로 사용
                candidate = (String) candidateObj;
            } else if (candidateObj instanceof Map) {
                // ✅ Map 형태면 필드별로 추출
                Map<String, Object> candidateMap = (Map<String, Object>) candidateObj;
                candidate = (String) candidateMap.get("candidate");
                sdpMid = (String) candidateMap.getOrDefault("sdpMid", "");
                sdpMLineIndex = ((Number) candidateMap.getOrDefault("sdpMLineIndex", 0)).intValue();
            } else {
                log.error("Invalid ICE Candidate format: {}", candidateObj);
                return;
            }

            // ✅ WebRTC Endpoint 가져오기
            WebRtcEndpoint webRtcEndpoint = kurentoManager.getParticipantEndpoint(huddleId, userId);
            if (webRtcEndpoint == null) {
                log.warn("허들에 참여 중이지 않은 유저입니다: userId={}", userId);
                return;
            }

            // ✅ ICE Candidate 적용
            webRtcEndpoint.addIceCandidate(new IceCandidate(candidate, sdpMid, sdpMLineIndex));

        } catch (Exception e) {
            log.error("Error handling ICE candidate", e);
        }
    }

    // ICE Candidate 전송 공통 메서드
    private final Object webSocketLock = new Object(); // 동기화용 Lock 객체

    private void sendIceCandidate(WebSocketSession session, IceCandidate candidate) {
        synchronized (webSocketLock) { // 동기화 블록 사용
            try {
                if (session == null || !session.isOpen()) {
                    log.warn("WebSocket session is null or closed. Cannot send ICE candidate.");
                    return;
                }

                Map<String, Object> candidateJson = Map.of(
                        "id", "iceCandidate",
                        "candidate", Map.of(
                                "candidate", candidate.getCandidate(),
                                "sdpMid", candidate.getSdpMid(),
                                "sdpMLineIndex", candidate.getSdpMLineIndex()
                        )
                );

                session.sendMessage(new TextMessage(gson.toJson(candidateJson))); // 동기화된 WebSocket 메시지 전송
                log.info("Sent ICE candidate: {}", candidateJson);

            } catch (IllegalStateException e) {
                log.error("Cannot send ICE candidate. WebSocket is in an invalid state: {}", e.getMessage());
            } catch (IOException e) {
                log.error("Failed to send ICE candidate", e);
            }
        }
    }
}
