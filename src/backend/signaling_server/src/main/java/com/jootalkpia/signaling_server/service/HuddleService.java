package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.exception.common.CustomException;
import com.jootalkpia.signaling_server.exception.common.ErrorCode;
import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.repository.HuddleCacheRepository;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.repository.ChannelHuddleRepository;
import com.jootalkpia.signaling_server.repository.HuddlePipelineRepository;
import com.jootalkpia.signaling_server.repository.UserHuddleRepository;
import com.jootalkpia.signaling_server.rtc.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class HuddleService {

    private final HuddleCacheRepository huddleCacheRepository;
    private final HuddleParticipantsRepository huddleParticipantsRepository;
    private final ChannelHuddleRepository channelHuddleRepository;
    private final UserHuddleRepository userHuddleRepository;
    private final HuddlePipelineRepository huddlePipelineRepository;
    private final ValidationUtils validationUtils;

    public Huddle createHuddle(Long channelId, Long userId) {
        String existingHuddleId = channelHuddleRepository.getHuddleByChannel(channelId);
        if (existingHuddleId != null) {
            throw new IllegalStateException("해당 채널에 이미 허들이 존재합니다.");
        }

        String huddleId = "huddle-" + System.currentTimeMillis();
        Huddle huddle = new Huddle(huddleId, channelId, userId, LocalDateTime.now());

        // 레디스에 허들 메타데이터(허들아이디, 채널아이디, 만든유저아이디, 생성시간) 저장
        huddleCacheRepository.saveHuddle(huddle);

        return huddle;
    }

    public void saveHuddleChannel(Long channelId, String huddleId) {
        channelHuddleRepository.saveChannelHuddle(channelId, huddleId);
    }

    public void addUserHuddle(Long userId, String huddleId) {
        userHuddleRepository.saveUserHuddle(userId, huddleId);
    }

    public void saveHuddleParticipant(Long userId, String huddleId) {
        huddleParticipantsRepository.addParticipant(huddleId, userId);
    }

    public void deleteHuddle(String huddleId) {
        Huddle huddle = huddleCacheRepository.getHuddleById(huddleId);
        if (huddle == null) {
            log.warn("삭제하려는 허들이 이미 없음: huddleId={}", huddleId);
            return;
        }

        log.info("허들 삭제 진행: {}", huddleId);

        // Redis에서 허들 삭제
        huddleCacheRepository.deleteHuddle(huddleId);

        // 채널-허들 매핑 삭제 (채널 ID는 Long 타입이어야 함)
        if (huddle.channelId() != null) {
            channelHuddleRepository.deleteChannelHuddle(huddle.channelId());  // Long 타입 전달
        }
    }

    public int getParticipantCount(String huddleId) {
        Set<Long> participants = huddleParticipantsRepository.getParticipants(huddleId);
        log.info("참가자 수: {}", participants.size());

        return participants == null ? 0 : participants.size();
    }

    public void recoverIfErrorJoining(Long userId, Long channelId) {
        try {
            // 채널이 허들에 존재하는지 확인하고 허들 ID 가져오기
            String huddleId = validationUtils.isHuddleInChannel(channelId);

            // 허들:참여자 확인 후 삭제
            validationUtils.removeParticipantIfExists(huddleId, userId);

            // 허들:엔드포인트 확인 후 삭제
            validationUtils.removeUserEndpointIfExists(huddleId, userId);

            // 유저:허들 확인 후 삭제
            validationUtils.removeUserHuddleIfExists(userId);

            // 허들에 남은 참가자가 없으면 삭제
            if (huddleParticipantsRepository.getParticipants(huddleId).isEmpty()) {
                // 허들 데이터 확인 후 삭제
                String storedHuddleId = channelHuddleRepository.getHuddleByChannel(channelId);
                if (storedHuddleId != null && storedHuddleId.equals(huddleId)) {
                    channelHuddleRepository.deleteChannelHuddle(channelId);
                    log.info("채널-허들 매핑 삭제 완료: channelId={}, huddleId={}", channelId, huddleId);
                }

                // 허들:파이프라인 확인 후 삭제
                String pipelineId = huddlePipelineRepository.getPipelineId(huddleId);
                if (pipelineId != null) {
                    huddlePipelineRepository.deleteHuddlePipeline(huddleId);
                    log.info("허들-파이프라인 삭제 완료: huddleId={}, pipelineId={}", huddleId, pipelineId);
                }

                // 채널:허들 확인 후 삭제
                String storedChannelHuddle = channelHuddleRepository.getHuddleByChannel(channelId);
                if (storedChannelHuddle != null && storedChannelHuddle.equals(huddleId)) {
                    channelHuddleRepository.deleteChannelHuddle(channelId);
                    log.info("채널-허들 데이터 삭제 완료: channelId={}", channelId);
                }

                // 허들에 남은 참가자가 없으면 최종 삭제
                if (getParticipantCount(huddleId) == 0) {
                    deleteHuddle(huddleId);
                    log.info("참여자가 없어 허들 삭제: {}", huddleId);
                }
            }
        } catch (Exception e) {
            throw new CustomException(ErrorCode.UNEXPECTED_ERROR.getCode(), "허들 복구 과정 중 오류 발생");
        }
    }
}
