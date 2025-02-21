package com.jootalkpia.signaling_server.rtc;

import com.jootalkpia.signaling_server.exception.common.CustomException;
import com.jootalkpia.signaling_server.exception.common.ErrorCode;
import com.jootalkpia.signaling_server.repository.ChannelHuddleRepository;
import com.jootalkpia.signaling_server.repository.HuddleCacheRepository;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.repository.HuddlePipelineRepository;
import com.jootalkpia.signaling_server.repository.UserHuddleRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ValidationUtils {
    private final UserHuddleRepository userHuddleRepository;
    private final HuddleParticipantsRepository huddleParticipantsRepository;
    private final HuddleCacheRepository huddleCacheRepository;
    private final HuddlePipelineRepository huddlePipelineRepository;
    private final ChannelHuddleRepository channelHuddleRepository;

    public void canUserJoinHuddle(String huddleId, Long userId) {
        try {
            if (userHuddleRepository.getUserHuddle(userId) != null) {
                throw new CustomException(ErrorCode.VALIDATION_FAILED.getCode(), "유저는 하나의 허들에만 참여할 수 있습니다.");
            }
            if (huddleCacheRepository.getHuddleById(huddleId) == null) {
                throw new CustomException(ErrorCode.HUDDLE_NOT_FOUND.getCode(), ErrorCode.HUDDLE_NOT_FOUND.getMsg());
            }
        } catch (Exception e) {
            throw new CustomException(ErrorCode.UNEXPECTED_ERROR.getCode(), "유저가 허들 참여 가능한지 검증 중 오류 발생");
        }
    }

    public void isHuddleValid(String huddleId) {
        try {
            if (huddleCacheRepository.getHuddleById(huddleId) == null) {
                throw new CustomException(ErrorCode.HUDDLE_NOT_FOUND.getCode(), ErrorCode.HUDDLE_NOT_FOUND.getMsg());
            }
        } catch (Exception e) {
            throw new CustomException(ErrorCode.UNEXPECTED_ERROR.getCode(), "허들 검증 중 오류 발생");
        }
    }

    public String isHuddleInChannel(Long channelId) {
//        try {
            String huddleId = channelHuddleRepository.getHuddleByChannel(channelId);
            if (huddleId == null) {
                throw new CustomException(ErrorCode.HUDDLE_NOT_IN_CHANNEL.getCode(), ErrorCode.HUDDLE_NOT_IN_CHANNEL.getMsg());
            }
            return huddleId;
//        } catch (Exception e) {
//            throw new CustomException(ErrorCode.UNEXPECTED_ERROR.getCode(), "채널-허들 검증 중 오류 발생");
//        }
    }

    public void isUserInHuddle(String huddleId, Long userId) {
        try {
            Set<Long> participants = huddleParticipantsRepository.getParticipants(huddleId);
            if (participants == null || !participants.contains(userId)) {
                throw new CustomException(ErrorCode.USER_NOT_FOUND.getCode(), "해당 허들에 유저가 존재하지 않습니다.");
            }
        } catch (Exception e) {
            throw new CustomException(ErrorCode.UNEXPECTED_ERROR.getCode(), "허들 내 유저 검증 중 오류 발생");
        }
    }

    public void canUserExitHuddle(String huddleId, Long userId) {
        try {
            if (huddleCacheRepository.getHuddleById(huddleId) == null) {
                throw new CustomException(ErrorCode.HUDDLE_NOT_FOUND.getCode(), ErrorCode.HUDDLE_NOT_FOUND.getMsg());
            }
        } catch (Exception e) {
            throw new CustomException(ErrorCode.UNEXPECTED_ERROR.getCode(), "허들 나가기 검증 중 오류 발생");
        }
    }

    public void isPipelineInChannel(String huddleId) {
        try {
            if (huddlePipelineRepository.getPipeline(huddleId) == null) {
                throw new CustomException(ErrorCode.PIPELINE_NOT_FOUND.getCode(), ErrorCode.PIPELINE_NOT_FOUND.getMsg());
            }
        } catch (Exception e) {
            throw new CustomException(ErrorCode.UNEXPECTED_ERROR.getCode(), "파이프라인 검증 중 오류 발생");
        }
    }

    // 허들:참여자 확인 후 삭제
    public void removeParticipantIfExists(String huddleId, Long userId) {
        try {
            Set<Long> participants = huddleParticipantsRepository.getParticipants(huddleId);
            if (participants == null || !participants.contains(userId)) {
                log.warn("허들에 존재하지 않는 참가자 제거 시도: huddleId={}, userId={}", huddleId, userId);
                return;
            }
            huddleParticipantsRepository.removeParticipant(huddleId, userId);
            log.info("허들 참가자 삭제 완료: huddleId={}, userId={}", huddleId, userId);
        } catch (Exception e) {
            log.error("허들 참가자 삭제 중 오류 발생 (무시됨): huddleId={}, userId={}", huddleId, userId, e);
        }
    }

    // 허들:엔드포인트 확인 후 삭제
    public void removeUserEndpointIfExists(String huddleId, Long userId) {
        try {
            String endpointId = huddleParticipantsRepository.getUserEndpoint(huddleId, userId);
            if (endpointId == null) {
                log.warn("해당 유저의 WebRTC 엔드포인트가 존재하지 않음: huddleId={}, userId={}", huddleId, userId);
                return;
            }
            huddleParticipantsRepository.removeUserEndpoint(huddleId, userId);
            log.info("WebRTC 엔드포인트 삭제 완료: huddleId={}, userId={}, endpointId={}", huddleId, userId, endpointId);
        } catch (Exception e) {
            log.error("WebRTC 엔드포인트 삭제 중 오류 발생 (무시됨): huddleId={}, userId={}", huddleId, userId, e);
        }
    }

    // 유저:허들 확인 후 삭제
    public void removeUserHuddleIfExists(Long userId) {
        try {
            String huddleId = userHuddleRepository.getUserHuddle(userId);
            if (huddleId == null) {
                log.warn("해당 유저가 속한 허들이 존재하지 않음: userId={}", userId);
                return;
            }
            userHuddleRepository.removeUserHuddle(userId);
            log.info("유저의 허들 삭제 완료: userId={}, huddleId={}", userId, huddleId);
        } catch (Exception e) {
            log.error("유저 허들 삭제 중 오류 발생 (무시됨): userId={}", userId, e);
        }
    }

}
