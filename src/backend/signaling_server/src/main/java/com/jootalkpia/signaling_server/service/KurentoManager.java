package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.rtc.KurentoRoom;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.repository.KurentoRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.KurentoClient;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class KurentoManager {

    private final KurentoClient kurentoClient;
    private final HuddleParticipantsRepository huddleParticipantsRepository;
    private final KurentoRoomRepository kurentoRoomRepository;

    // KurentoRoom 생성
    public void createRoom(String huddleId) {
        if (kurentoRoomRepository.getRoom(huddleId) != null) {
            throw new IllegalStateException("이미 존재하는 KurentoRoom입니다.");
        }

        KurentoRoom room = new KurentoRoom(huddleId, kurentoClient.createMediaPipeline());
        kurentoRoomRepository.saveRoom(huddleId, room);
    }

    // 방 정보 조회
    public KurentoRoom getRoom(String huddleId) {
        return kurentoRoomRepository.getRoom(huddleId);
    }

    // 참가자 추가
    public WebRtcEndpoint addParticipantToRoom(String huddleId, Long userId) {
        KurentoRoom room = getRoom(huddleId);
        if (room == null) {
            throw new IllegalStateException("존재하지 않는 KurentoRoom입니다.");
        }

        // 기존 참가자인지 확인 (중복 방지)
        if (huddleParticipantsRepository.getParticipants(huddleId).contains(userId)) {
            log.warn("참가자가 이미 허들에 존재함: huddleId={}, userId={}", huddleId, userId);
            return room.getParticipant(userId);
        }

        // WebRTC 엔드포인트 생성 및 추가
        WebRtcEndpoint webRtcEndpoint = room.addParticipant(userId);

        // 참가자 정보 저장
        huddleParticipantsRepository.addParticipant(huddleId, userId);
        huddleParticipantsRepository.saveUserEndpoint(huddleId, userId, webRtcEndpoint.getId());

        return webRtcEndpoint;
    }

    // 참가자의 WebRTC 엔드포인트 가져오기
    public WebRtcEndpoint getParticipantEndpoint(String huddleId, Long userId) {
        KurentoRoom room = getRoom(huddleId);
        if (room == null) {
            log.warn("KurentoRoom을 찾을 수 없습니다: huddleId={}", huddleId);
            return null;
        }

        WebRtcEndpoint endpoint = room.getParticipant(userId);
        if (endpoint == null) {
            log.warn("참가자의 WebRTC 엔드포인트를 찾을 수 없음: huddleId={}, userId={}", huddleId, userId);
        }
        return endpoint;
    }

    // 참가자 제거
    public void removeParticipantFromRoom(String huddleId, Long userId) {
        KurentoRoom room = getRoom(huddleId);
        if (room == null) {
            log.warn("KurentoRoom을 찾을 수 없습니다: huddleId={}", huddleId);
            return;
        }

        // 유효한 참가자인지 확인
        Set<Long> participants = huddleParticipantsRepository.getParticipants(huddleId);
        if (participants == null || !participants.contains(userId)) {
            log.warn("유효하지 않은 참가자 제거 시도: huddleId={}, userId={}", huddleId, userId);
            return;
        }

        // WebRTC 엔드포인트 제거
        room.removeParticipant(userId);

        // 참가자 정보 삭제
        huddleParticipantsRepository.removeParticipant(huddleId, userId);
        huddleParticipantsRepository.removeUserEndpoint(huddleId, userId);
        log.info("참가자 제거 완료: huddleId={}, userId={}", huddleId, userId);

        //  허들에 남아 있는 참가자 수 확인 후 방 삭제
        if (huddleParticipantsRepository.getParticipants(huddleId).isEmpty()) {
            removeRoom(huddleId);
        }
    }

    // 방 삭제
    public void removeRoom(String huddleId) {
        KurentoRoom room = getRoom(huddleId);
        if (room == null) {
            log.warn("삭제하려는 KurentoRoom이 없음: huddleId={}", huddleId);
            return;
        }

        // 모든 참가자의 WebRTC 엔드포인트 제거
        Set<Long> participants = huddleParticipantsRepository.getParticipants(huddleId);
        if (participants != null) {
            for (Long userId : participants) {
                room.removeParticipant(userId);
                huddleParticipantsRepository.removeUserEndpoint(huddleId, userId);
            }
        }

        // MediaPipeline 정리
        room.closeRoom();

        // Redis에서 허들 정보 삭제
        huddleParticipantsRepository.removeParticipant(huddleId, null);
        kurentoRoomRepository.deleteRoom(huddleId);

        log.info("KurentoRoom 삭제 완료: huddleId={}", huddleId);
    }
}