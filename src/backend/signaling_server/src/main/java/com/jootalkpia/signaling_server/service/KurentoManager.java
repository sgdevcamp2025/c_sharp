package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.rtc.KurentoRoom;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class KurentoManager {

    private final KurentoClient kurentoClient;
    private final HuddleParticipantsRepository huddleParticipantsRepository;
    private final Map<String, KurentoRoom> rooms = new ConcurrentHashMap<>();

    // KurentoRoom 생성 (Redis의 허들 ID 기반으로 관리)
    public void createRoom(String huddleId) {
        if (rooms.containsKey(huddleId)) {
            throw new IllegalStateException("이미 존재하는 KurentoRoom입니다.");
        }

        MediaPipeline pipeline = kurentoClient.createMediaPipeline();
        KurentoRoom room = new KurentoRoom(huddleId, pipeline);
        rooms.put(huddleId, room);
    }

    // 방 정보 조회
    public KurentoRoom getRoom(String huddleId) {
        return rooms.get(huddleId);
    }

    // 방 삭제 (허들 종료 시)
    public void removeRoom(String huddleId) {
        KurentoRoom room = rooms.remove(huddleId);
        if (room != null) {
            room.closeRoom();
        }
    }

    // 참가자 추가
    public WebRtcEndpoint addParticipantToRoom(String huddleId, Long userId) {
        KurentoRoom room = rooms.get(huddleId);
        if (room == null) {
            throw new IllegalStateException("존재하지 않는 KurentoRoom입니다.");
        }

        huddleParticipantsRepository.addParticipant(huddleId, userId); // Redis에도 참여자 추가
        return room.addParticipant(userId);
    }

    // 참가자 제거
    public void removeParticipantFromRoom(String huddleId, Long userId) {
        KurentoRoom room = rooms.get(huddleId);
        if (room != null) {
            room.removeParticipant(userId);
        }
        huddleParticipantsRepository.removeParticipant(huddleId, userId); // Redis에서도 참여자 삭제

        // 마지막 참가자가 나가면 방 삭제
        if (huddleParticipantsRepository.getParticipants(huddleId).isEmpty()) {
            removeRoom(huddleId);
        }
    }
}
