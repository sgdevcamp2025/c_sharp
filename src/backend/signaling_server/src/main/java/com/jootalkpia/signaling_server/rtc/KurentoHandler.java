package com.jootalkpia.signaling_server.rtc;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.ToNumberPolicy;
import com.jootalkpia.signaling_server.model.Huddle;
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
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class KurentoHandler extends TextWebSocketHandler {

    private final Map<Long, KurentoUserSession> userSessions = new ConcurrentHashMap<>();
    private final Gson gson = new GsonBuilder().setObjectToNumberStrategy(ToNumberPolicy.LONG_OR_DOUBLE).create();
    private final HuddleService huddleService;
    private final KurentoManager kurentoManager;

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        Map<String, Object> json = gson.fromJson(message.getPayload(), Map.class);
        String id = (String) json.get("id");

        switch (id) {
            case "createRoom":
                handleCreateRoom(session, json);
                break;
            case "joinRoom":
                handleJoinRoom(session, json);
                break;
            case "leaveRoom":
                handleLeaveRoom(session, json);
                break;
            case "offer":
                handleOffer(session, json);
                break;
            case "iceCandidate":
                handleIceCandidate(session, json);
                break;
            default:
                log.warn("Unknown message type received: {}", id);
        }
    }

    // 허들 생성
    private void handleCreateRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long channelId = ((Number) json.get("channelId")).longValue();
            Long userId = ((Number) json.get("userId")).longValue();

            // 허들 생성, 저장
            Huddle newHuddle = huddleService.createHuddle(channelId, userId);

            // 쿠렌토 매니저 호출
            kurentoManager.createRoom(newHuddle.getHuddleId(), channelId);

            // 자동으로 허들 입장도 처리
            Map<String, Object> joinJson = Map.of(
                    "id", "joinRoom",
                    "huddleId", newHuddle.getHuddleId(),
                    "userId", userId,
                    "channelId", channelId
            );
            handleJoinRoom(session, joinJson);

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "roomCreated", "huddleId", newHuddle.getHuddleId()))));
        } catch (Exception e) {
            log.error("Error creating room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to create room"))));
        }
    }

    // 허들 입장
    private void handleJoinRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long channelId = ((Number) json.get("channelId")).longValue();
            String huddleId = (String) json.get("huddleId");
            Long userId = ((Number) json.get("userId")).longValue();

            // 허들 참여
            huddleService.joinHuddle(huddleId, userId, channelId);

            // 매니저 호출, 파이프라인 재사용하여 추가
            WebRtcEndpoint webRtcEndpoint = kurentoManager.addParticipantToRoom(huddleId, userId, channelId);
            KurentoUserSession kUserSession = new KurentoUserSession(userId, huddleId, session, webRtcEndpoint);
            userSessions.put(userId, kUserSession);

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "joinedRoom", "huddleId", huddleId))));
        } catch (Exception e) {
            log.error("Error joining room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to join room"))));
        }
    }

    // 허들 나감
    private void handleLeaveRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long channelId = json.get("channelId") != null ? ((Number) json.get("channelId")).longValue() : null;
            String huddleId = json.get("huddleId") != null ? (String) json.get("huddleId") : null;
            Long userId = json.get("userId") != null ? ((Number) json.get("userId")).longValue() : null;

            if (channelId == null || huddleId == null || userId == null) {
                log.warn("Invalid leaveRoom request: {}", json);
                session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Invalid leaveRoom request"))));
                return;
            }

            huddleService.exitHuddle(huddleId, userId, channelId);

            // 유저 세션 삭제
            KurentoUserSession userSession = userSessions.remove(userId);
            if (userSession == null) {
                log.warn("User session not found for userId: {}", userId);
                session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "User session not found!"))));
                return;
            }

            // Kurento에서 해당 사용자의 WebRTC 연결 제거
            kurentoManager.removeParticipantFromRoom(huddleId, userId, channelId);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "leftRoom", "huddleId", huddleId))));
        } catch (Exception e) {
            log.error("Error leaving room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to leave room"))));
        }
    }

    // SDP Offer 처리
    private void handleOffer(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long userId = ((Number) json.get("userId")).longValue();
            String sdpOffer = (String) json.get("sdpOffer");

            // 유저가 이미 Kurento에 등록되었는지 확인
            KurentoUserSession kUserSession = userSessions.get(userId);
            if (kUserSession == null) {
                log.warn("User session not found for userId: {}", userId);
                session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "User session not found!"))));
                return;
            }

            WebRtcEndpoint webRtcEndpoint = kUserSession.getWebRtcEndpoint();

            // ICE Candidate 리스너 추가
            webRtcEndpoint.addIceCandidateFoundListener(event -> {
                try {
                    Map<String, Object> candidateMsg = Map.of(
                            "id", "iceCandidate",
                            "candidate", event.getCandidate()
                    );
                    session.sendMessage(new TextMessage(gson.toJson(candidateMsg)));
                    log.info("Sent ICE candidate: {}", event.getCandidate());
                } catch (IOException e) {
                    log.error("Failed to send ICE candidate", e);
                }
            });

            String sdpAnswer = webRtcEndpoint.processOffer(sdpOffer);
            webRtcEndpoint.gatherCandidates(); // ICE candidate 요청

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "answer", "sdpAnswer", sdpAnswer))));
        } catch (Exception e) {
            log.error("Error handling offer", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to process offer"))));
        }
    }


    // ICE Candidate 처리
    private void handleIceCandidate(WebSocketSession session, Map<String, Object> json) {
        try {
            Long userId = ((Number) json.get("userId")).longValue();
            String candidate = (String) json.get("candidate");

            KurentoUserSession userSession = userSessions.get(userId);
            if (userSession != null) {
                IceCandidate iceCandidate = new IceCandidate(candidate, "", 0);
                userSession.getWebRtcEndpoint().addIceCandidate(iceCandidate);
            }
        } catch (Exception e) {
            log.error("Error handling ICE candidate", e);
        }
    }


}
