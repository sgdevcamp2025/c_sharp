package com.jootalkpia.signaling_server.rtc;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.IceCandidate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
@RequiredArgsConstructor
public class CallHandler {

    @Qualifier("customUserRegistry")
    private final UserRegistry registry;
    private final HuddleManager huddleManager;

    @MessageMapping("/signal")
    public void handleSignalMessage(StompHeaderAccessor headerAccessor, @Payload String message) {
        final JsonObject jsonMessage = JsonParser.parseString(message).getAsJsonObject();

        String sessionId = headerAccessor.getSessionId();
        UserSession userSession = registry.getBySessionId(sessionId);

        if (userSession != null) {
            log.debug("Incoming message from user '{}': {}", userSession.getUserId(), jsonMessage);
        } else {
            log.debug("Incoming message from new user: {}", jsonMessage);
        }

        switch (jsonMessage.get("id").getAsString()) {
            case "joinHuddle":
                joinHuddle(jsonMessage, sessionId);
                break;
            case "receiveVideoFrom":
                final Long senderId = jsonMessage.get("sender").getAsLong();
                final UserSession sender = registry.getByUserId(senderId);
                final String sdpOffer = jsonMessage.get("sdpOffer").getAsString();
                userSession.receiveVideoFrom(sender, sdpOffer);
                break;
            case "leaveRoom":
                leaveRoom(userSession);
                break;
            case "onIceCandidate":
                JsonObject candidate = jsonMessage.get("candidate").getAsJsonObject();
                IceCandidate cand = new IceCandidate(
                        candidate.get("candidate").getAsString(),
                        candidate.get("sdpMid").getAsString(),
                        candidate.get("sdpMLineIndex").getAsInt()
                );
                userSession.addCandidate(cand, jsonMessage.get("sender").getAsLong());
                break;
            default:
                break;
        }
    }

    private void joinHuddle(JsonObject jsonMessage, String sessionId) {
        final Long channelId = jsonMessage.get("channelId").getAsLong();
        final Long userId = jsonMessage.get("userId").getAsLong();
        log.info("PARTICIPANT {}: trying to join room {}", userId, channelId);

        Huddle huddle = huddleManager.getHuddle(channelId);
        final UserSession userSession = huddle.join(userId, sessionId);
        registry.register(userSession);
    }

    private void leaveRoom(UserSession userSession) {
        final Huddle huddle = huddleManager.getHuddle(userSession.getChannelId());
        huddle.leave(userSession);
        if (huddle.getParticipants().isEmpty()) {
            huddleManager.removeHuddle(huddle);
        }
    }
}
