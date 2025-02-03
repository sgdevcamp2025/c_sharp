package com.jootalkpia.signaling_server.rtc;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Getter
public class KurentoRoom {
    private final String huddleId;
    private final MediaPipeline pipeline;
    private final Map<Long, WebRtcEndpoint> participants = new ConcurrentHashMap<>();

    // 참가자가 이미 존재하는지 확인! ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️ 다 넣기
    public boolean hasParticipant(String userId) {
        return participants.containsKey(userId);
    }

    // 이미 있는 WebRtcEndpoint 반환 or 새로운 WebRtcEndpoint 생성
    public WebRtcEndpoint addParticipant(Long userId) {
        if (participants.containsKey(userId)) {
            // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
            return participants.get(userId);
        }

        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(pipeline).build();
        participants.put(userId, webRtcEndpoint);
        return webRtcEndpoint;
    }

    // 참가자 제거
    public void removeParticipant(Long userId) {
        WebRtcEndpoint endpoint = participants.remove(userId);
        if (endpoint != null) {
            endpoint.release();
        }
    }

    // 방 닫기 (모든 참가자 해제)
    public void closeRoom() {
        for (WebRtcEndpoint endpoint : participants.values()) {
            endpoint.release();
        }
        participants.clear();
        pipeline.release();
    }
}