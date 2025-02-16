package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.exception.common.CustomException;
import com.jootalkpia.signaling_server.exception.common.ErrorCode;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.repository.HuddlePipelineRepository;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.print.attribute.standard.Media;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.IceCandidate;
import org.kurento.client.KurentoClient;
import org.kurento.client.MediaElement;
import org.kurento.client.MediaObject;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class KurentoService {

    private final KurentoClient kurentoClient;
    private final HuddleService huddleService;
    private final HuddleParticipantsRepository huddleParticipantsRepository;
    private final HuddlePipelineRepository huddlePipelineRepository;
    private final StringRedisTemplate redisTemplate;

    // KurentoRoom 생성
    public void createPipeline(String huddleId) {
        if (huddlePipelineRepository.getPipeline(huddleId) != null) {
            throw new IllegalStateException("이미 허들-파이프라인이 존재합니다.");
        }

        String pipelineId = kurentoClient.createMediaPipeline().getId();
        huddlePipelineRepository.saveHuddlePipeline(huddleId, pipelineId);

        // Redis에 올바르게 저장되었는지 검증
        String savedPipelineId = huddlePipelineRepository.getPipelineId(huddleId);
        if (savedPipelineId == null || !savedPipelineId.equals(pipelineId)) {
            throw new CustomException(ErrorCode.PIPELINE_NOT_FOUND.getCode(), "파이프라인이 정상적으로 저장되지 않았습니다.");
        }
    }

    // 방 정보 조회
    public MediaPipeline getPipeline(String huddleId) {
        return huddlePipelineRepository.getPipeline(huddleId);
    }

    // 참가자 추가
    public WebRtcEndpoint addParticipantToRoom(String huddleId, Long userId) {
        log.info("add participant to room in kurento service");
        // 해당 허들의 pipelineId 가져오기
        String pipelineId = redisTemplate.opsForValue().get("huddle:" + huddleId + ":pipeline");

        if (pipelineId == null) {
            throw new IllegalStateException("해당 huddleId=" + huddleId + "에 대한 MediaPipeline ID를 찾을 수 없습니다.");
        }

        // pipelineId를 이용하여 MediaPipeline 복원
        MediaPipeline pipeline = kurentoClient.getById(pipelineId, MediaPipeline.class);
        if (pipeline == null) {
            throw new IllegalStateException("Kurento에서 pipelineId=" + pipelineId + "를 찾을 수 없습니다.");
        }

        log.info("🍎🍎🍎🍎🍎🍎");

        // WebRTC 엔드포인트 생성 및 해당 파이프라인에 추가
        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(pipeline).build();

        log.info("add participant to room in kurento service: 엔포 생성 및 파이프라인에 추가");

        List<MediaObject> mediaObjects = pipeline.getChildren();
        int webRtcEndpointCount = 0;

        for (MediaObject obj : mediaObjects) {
            if (obj instanceof MediaElement) {  // MediaElement인지 확인
                MediaElement element = (MediaElement) obj;  // 안전한 다운캐스팅
                if (element instanceof WebRtcEndpoint) {
                    webRtcEndpointCount++;
                }
            }
        }

        log.info("😄😄😄😄😄현재 허들 " + huddleId + "에 연결된 WebRtcEndpoint 개수: " + webRtcEndpointCount);


        // 허들:참가자 저장
        huddleService.saveHuddleParticipant(userId, huddleId);

        log.info("add participant to room in kurento service: 허들:참가자 저장");

        // 허들:엔드포인트 저장
        huddleParticipantsRepository.saveUserEndpoint(huddleId, userId, webRtcEndpoint.getId());
        log.info("add participant to room in kurento service: 허들 엔포 저장");

        return webRtcEndpoint;
    }


    public WebRtcEndpoint getParticipantEndpoint(String huddleId, Long userId) {
        if (huddleId == null) {
            throw new CustomException(ErrorCode.HUDDLE_NOT_FOUND.getCode(), "허들 ID가 null입니다.");
        }

        // 저장된 엔드포인트 ID 가져오기
        String endpointId = huddleParticipantsRepository.getUserEndpoint(huddleId, userId);

        if (endpointId == null) {
            log.error("Redis에서 엔드포인트 조회 실패: userId={}", userId);
            throw new CustomException(ErrorCode.ENDPOINT_NOT_FOUND.getCode(), ErrorCode.ENDPOINT_NOT_FOUND.getMsg());
        }

        // 엔드포인트 ID를 이용하여 WebRtcEndpoint 복원
        WebRtcEndpoint endpoint = kurentoClient.getById(endpointId, WebRtcEndpoint.class);

        if (endpoint == null) {
            log.warn("Kurento에서 엔드포인트 ID={} 를 찾을 수 없음: huddleId={}, userId={}", endpointId, huddleId, userId);
            throw new CustomException(ErrorCode.ENDPOINT_NOT_FOUND.getCode(), ErrorCode.ENDPOINT_NOT_FOUND.getMsg());
        }

        // ICE Candidate 감지 이벤트 리스너 추가
        endpoint.addIceCandidateFoundListener(event -> {
            IceCandidate candidate = event.getCandidate();
            log.info("ICE Candidate found for user {} in huddle {}: {}", userId, huddleId, candidate.getCandidate());
        });

        // 대신 ICE Candidate 감지 이벤트 리스너 추가
        endpoint.addIceCandidateFoundListener(event -> {
            log.info("ICE Candidate found for user {}: {}", userId, event.getCandidate().getCandidate());
        });

        return endpoint;
    }

    public Map<Long, WebRtcEndpoint> getParticipants(String huddleId) {
        Map<Long, WebRtcEndpoint> participantsMap = new HashMap<>();

        // 해당 huddleId의 참가자 목록 조회
        Set<Long> participantsIds = huddleParticipantsRepository.getParticipants(huddleId);

        for (Long userId : participantsIds) {
            // 유저의 엔드포인트 ID 조회
            String endpointId = huddleParticipantsRepository.getUserEndpoint(huddleId, userId);

            if (endpointId != null) {
                // 엔드포인트 ID를 이용하여 WebRtcEndpoint 복원
                WebRtcEndpoint endpoint = kurentoClient.getById(endpointId, WebRtcEndpoint.class);

                if (endpoint != null) {
                    participantsMap.put(userId, endpoint);
                } else {
                    log.warn("WebRtcEndpoint not found for user {} in huddle {}", userId, huddleId);
                }
            } else {
                log.warn("Endpoint ID not found for user {} in huddle {}", userId, huddleId);
            }
        }

        return participantsMap;
    }



    // 참가자 제거
    public void removeParticipantFromRoom(String huddleId, Long userId) {
        MediaPipeline pipeline = getPipeline(huddleId);
        if (pipeline == null) {
            log.warn("파이프라인을 찾을 수 없습니다: huddleId={}", huddleId);
            return;
        }

        // 유효한 참가자인지 확인
        Set<Long> participants = huddleParticipantsRepository.getParticipants(huddleId);
        if (participants == null || !participants.contains(userId)) {
            log.warn("유효하지 않은 참가자 제거 시도: huddleId={}, userId={}", huddleId, userId);
            return;
        }

        // WebRTC 엔드포인트 제거
        huddleParticipantsRepository.removeUserEndpoint(huddleId, userId);

        // 참가자 정보 삭제
        huddleParticipantsRepository.removeParticipant(huddleId, userId);
        huddleParticipantsRepository.removeUserEndpoint(huddleId, userId);
        log.info("참가자 제거 완료: huddleId={}, userId={}", huddleId, userId);

        //  허들에 남아 있는 참가자 수 확인 후 방 삭제
        if (huddleParticipantsRepository.getParticipants(huddleId).isEmpty()) {
            removeRoom(huddleId);
        }
    }

    // 방 삭제, 파이프라인 해제
    public void removeRoom(String huddleId) {
        MediaPipeline pipeline = getPipeline(huddleId);
        if (pipeline == null) {
            log.warn("파이프라인을 찾을 수 없습니다: huddleId={}", huddleId);
            return;
        }

        Set<Long> participants = huddleParticipantsRepository.getParticipants(huddleId);
        if (participants != null) {
            for (Long userId : participants) {
                huddleParticipantsRepository.removeUserEndpoint(huddleId, userId);
            }
        }

        // MediaPipeline 해제
        try {
            pipeline.release();
            log.info("MediaPipeline 삭제 완료: huddleId={}, pipelineId={}", huddleId, pipeline.getId());
        } catch (Exception e) {
            log.error("파이프라인 삭제 중 오류 발생: huddleId={}, pipelineId={}", huddleId, pipeline.getId(), e);
        }

        log.info("KurentoRoom 삭제 완료: huddleId={}", huddleId);
    }

}
