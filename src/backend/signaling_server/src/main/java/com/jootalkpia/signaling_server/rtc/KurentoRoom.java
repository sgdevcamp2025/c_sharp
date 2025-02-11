package com.jootalkpia.signaling_server.rtc;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;

import java.io.Serializable;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Getter
public class KurentoRoom implements Serializable { // 🚀 직렬화 추가
    private final String huddleId;
    private final transient MediaPipeline pipeline; // 🚨 Kurento 객체는 직렬화 불가능
    private final Map<Long, WebRtcEndpoint> participants = new ConcurrentHashMap<>();

    // ✅ 참가자 추가
    public WebRtcEndpoint addParticipant(Long userId) {
        if (participants.containsKey(userId)) {
            return participants.get(userId);
        }

        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(pipeline).build();
        participants.put(userId, webRtcEndpoint);
        return webRtcEndpoint;
    }

    // ✅ 특정 참가자의 WebRTC 엔드포인트 가져오기
    public WebRtcEndpoint getParticipant(Long userId) {
        return participants.get(userId);
    }

    // ✅ 참가자 제거
    public void removeParticipant(Long userId) {
        WebRtcEndpoint endpoint = participants.remove(userId);
        if (endpoint != null) {
            endpoint.release();
        }
    }

    // ✅ 방 닫기 (모든 참가자 해제)
    public void closeRoom() {
        for (WebRtcEndpoint endpoint : participants.values()) {
            endpoint.release();
        }
        participants.clear();
        pipeline.release();
    }
}

