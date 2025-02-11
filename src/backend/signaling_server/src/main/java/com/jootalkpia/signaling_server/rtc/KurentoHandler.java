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

            // 🚀 KurentoRoom 생성 (Redis에 저장)
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

            // 🚀 WebRTC 엔드포인트 생성 및 저장
            WebRtcEndpoint webRtcEndpoint = kurentoManager.addParticipantToRoom(huddleId, userId);

            // 파이프라인에 엔드포인트 추가
            webRtcEndpoint.connect(webRtcEndpoint);

            // 🚀 Redis에 WebRTC 엔드포인트 정보 저장
            // ✅ Redis에 참가자 추가
            huddleParticipantsRepository.addParticipant(huddleId, userId);
            huddleParticipantsRepository.saveUserEndpoint(huddleId, userId, webRtcEndpoint.getId());

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

            // 🚀 Redis에서 참여자 제거
            huddleParticipantsRepository.removeParticipant(huddleId, userId);
            huddleParticipantsRepository.removeUserEndpoint(huddleId, userId);

            // 🚀 Kurento에서 엔드포인트 제거
            kurentoManager.removeParticipantFromRoom(huddleId, userId);

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

            // 🚀 변경된 부분: getRoom().getParticipant() 대신 getParticipantEndpoint() 사용
            WebRtcEndpoint webRtcEndpoint = kurentoManager.getParticipantEndpoint(huddleId, userId);
            if (webRtcEndpoint == null) {
                log.warn("User session not found for userId: {}", userId);
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
            String candidate = (String) json.get("candidate");

            // 🚀 변경된 부분: getRoom().getParticipant() 대신 getParticipantEndpoint() 사용
            WebRtcEndpoint webRtcEndpoint = kurentoManager.getParticipantEndpoint(huddleId, userId);
            if (webRtcEndpoint != null) {
                webRtcEndpoint.addIceCandidate(new IceCandidate(candidate, "", 0));
            }
        } catch (Exception e) {
            log.error("Error handling ICE candidate", e);
        }
    }

    // ICE Candidate 전송 공통 메서드
    private void sendIceCandidate(WebSocketSession session, IceCandidate candidate) {
        try {
            if (!session.isOpen()) {
                log.warn("WebSocket session is closed. Cannot send ICE candidate.");
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

            session.sendMessage(new TextMessage(gson.toJson(candidateJson)));
        } catch (IOException e) {
            log.error("Failed to send ICE candidate", e);
        }
    }
}
