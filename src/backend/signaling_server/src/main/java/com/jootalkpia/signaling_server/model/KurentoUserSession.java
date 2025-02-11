package com.jootalkpia.signaling_server.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.kurento.client.IceCandidate;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.web.socket.WebSocketSession;

@RequiredArgsConstructor
@Getter
public class KurentoUserSession {
    private final Long userId;
    private final String huddleId;
    private final WebSocketSession session;
    private final WebRtcEndpoint webRtcEndpoint;

    public void addIceCandidate(IceCandidate candidate) {
        webRtcEndpoint.addIceCandidate(candidate);
    }
}
