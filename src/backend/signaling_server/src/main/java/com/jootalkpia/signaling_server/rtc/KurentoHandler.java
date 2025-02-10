package com.jootalkpia.signaling_server.rtc;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.ToNumberPolicy;
import com.jootalkpia.signaling_server.exception.common.CustomException;
import com.jootalkpia.signaling_server.exception.common.ErrorCode;
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
            case "createRoom" -> handleCreateRoom(session, json);
            case "joinRoom" -> handleJoinRoom(session, json);
            case "leaveRoom" -> handleLeaveRoom(session, json);
            case "offer" -> handleOffer(session, json);
            case "iceCandidate" -> handleIceCandidate(session, json);
            default ->
                    log.warn("Unknown message type received: {}", id);
//                    throw new CustomException(ErrorCode.BAD_REQUEST.getCode(), ErrorCode.BAD_REQUEST.getMsg());
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

            // 허들 생성, 저장
            Huddle newHuddle = huddleService.createHuddle(channelId, userId);
            kurentoManager.createRoom(newHuddle.huddleId(), channelId);

            // 자동으로 허들 입장도 처리
            Map<String, Object> joinJson = Map.of(
                    "id", "joinRoom",
                    "huddleId", newHuddle.huddleId(),
                    "userId", userId,
                    "channelId", channelId
            );
            handleJoinRoom(session, joinJson);

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "roomCreated", "huddleId", newHuddle.huddleId()))));
        } catch (Exception e) {
            log.error("Error creating room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to create room"))));
        }
    }

    // 허들 입장
    private void handleJoinRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long channelId = getLongValueFromJson(json, "channelId");
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");

            huddleService.joinHuddle(huddleId, userId, channelId);
            WebRtcEndpoint webRtcEndpoint = kurentoManager.addParticipantToRoom(huddleId, userId, channelId);
            userSessions.put(userId, new KurentoUserSession(userId, huddleId, session, webRtcEndpoint));

            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "joinedRoom", "huddleId", huddleId))));
        } catch (Exception e) {
            log.error("Error joining room", e);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "error", "message", "Failed to join room"))));
        }
    }

    // 허들 나감
    private void handleLeaveRoom(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long channelId = getLongValueFromJson(json, "channelId");
            Long userId = getLongValueFromJson(json, "userId");
            String huddleId = (String) json.get("huddleId");

            huddleService.exitHuddle(huddleId, userId, channelId);
            KurentoUserSession userSession = userSessions.remove(userId);

            if (userSession == null) {
                log.warn("User session not found for userId: {}", userId);
                return;
            }

            kurentoManager.removeParticipantFromRoom(huddleId, userId, channelId);
            session.sendMessage(new TextMessage(gson.toJson(Map.of("id", "leftRoom", "huddleId", huddleId))));
        } catch (Exception e) {
            log.error("Error leaving room", e);
        }
    }

    // SDP Offer 처리
    private void handleOffer(WebSocketSession session, Map<String, Object> json) throws IOException {
        try {
            Long userId = getLongValueFromJson(json, "userId");
            String sdpOffer = (String) json.get("sdpOffer");

            KurentoUserSession kUserSession = userSessions.get(userId);
            if (kUserSession == null) {
                log.warn("User session not found for userId: {}", userId);
                return;
            }

            WebRtcEndpoint webRtcEndpoint = kUserSession.getWebRtcEndpoint();

            // ICE Candidate 이벤트 리스너 추가 (null 값 검사)
            webRtcEndpoint.addIceCandidateFoundListener(event -> {
                IceCandidate candidate = event.getCandidate();
                if (candidate.getSdpMid() == null || candidate.getSdpMLineIndex() < 0) {
                    log.warn("Invalid ICE Candidate received from Kurento: {}", candidate);
                    return;  // 잘못된 데이터는 전송하지 않음
                }
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
            String candidate = (String) json.get("candidate");

            KurentoUserSession userSession = userSessions.get(userId);
            if (userSession != null) {
                userSession.getWebRtcEndpoint().addIceCandidate(new IceCandidate(candidate, "", 0));
            }
        } catch (Exception e) {
            log.error("Error handling ICE candidate", e);
        }
    }

    // ICE Candidate 전송 공통 메서드
    private final Object webSocketLock = new Object(); // 동기화용 Lock 객체

    private void sendIceCandidate(WebSocketSession session, IceCandidate candidate) {
        synchronized (webSocketLock) { // 동기화 블록 사용
            try {
                // 웹소켓이 닫혀 있으면 전송 안 하도록 처리
                if (!session.isOpen()) {
                    log.warn("WebSocket session is closed. Cannot send ICE candidate.");
                    return;
                }

                // ICE Candidate JSON 변환
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