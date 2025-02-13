package com.jootalkpia.signaling_server.rtc;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;

import java.io.Serializable;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자 추가 (Jackson 역직렬화 가능하게 함)
public class KurentoRoom implements Serializable {
    private String huddleId;
    private String pipelineId; // MediaPipeline 객체 대신 ID만 저장

    @JsonIgnore // JSON 직렬화에서 제외
    private transient MediaPipeline pipeline;

    @JsonIgnore // WebRtcEndpoint 객체 직렬화 방지
    private transient Map<Long, WebRtcEndpoint> participants = new ConcurrentHashMap<>();

    // 새로운 방 생성 시 사용
    public KurentoRoom(String huddleId, MediaPipeline pipeline) {
        this.huddleId = huddleId;
        this.pipeline = pipeline;
        this.pipelineId = pipeline.getId();
    }

    // Redis 역직렬화 시 사용할 생성자
    public KurentoRoom(String huddleId, String pipelineId) {
        this.huddleId = huddleId;
        this.pipelineId = pipelineId;
    }

    // pipeline 복원 함수
    public void restorePipeline(MediaPipeline pipeline) {
        this.pipeline = pipeline;
    }

    // 파이프라인에 참가자 엔드포인트 추가
    public WebRtcEndpoint addParticipant(Long userId) {
        return participants.computeIfAbsent(userId, id -> new WebRtcEndpoint.Builder(pipeline).build());
    }

    // 특정 참가자의 WebRTC 엔드포인트 가져오기
    public WebRtcEndpoint getParticipant(Long userId) {
        return participants.get(userId);
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
        participants.values().forEach(WebRtcEndpoint::release);
        participants.clear();
        if (pipeline != null) {
            pipeline.release();
        }
    }
}
