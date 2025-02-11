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

    // ✅ 방 닫기 (모든 참가자 해제)
    public void closeRoom() {
        for (WebRtcEndpoint endpoint : participants.values()) {
            endpoint.release();
        }
        participants.clear();
        pipeline.release();
    }
}
