package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.repository.HuddleCacheRepository;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.repository.ChannelHuddleRepository;
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

    /**
     * 허들 생성
     */
    public Huddle createHuddle(Long channelId, Long userId) {
        String existingHuddleId = channelHuddleRepository.getHuddleByChannel(channelId);
        if (existingHuddleId != null) {
            throw new IllegalStateException("해당 채널에 이미 허들이 존재합니다.");
        }

        String huddleId = "huddle-" + System.currentTimeMillis();
        Huddle huddle = new Huddle(huddleId, channelId, userId, LocalDateTime.now());

        // 레디스에 허들 메타데이터(허들아이디, 채널아이디, 만든유저아이디, 생성시간) 저장
        huddleCacheRepository.saveHuddle(huddle);

        // 채널과 허들 매핑
        channelHuddleRepository.saveChannelHuddle(channelId, huddleId);

        return huddle;
    }

    /**
     * 허들 참가
     */
    public void joinHuddle(String huddleId, Long userId) {
        if (huddleCacheRepository.getHuddleById(huddleId) == null) {
            throw new IllegalStateException("존재하지 않는 허들입니다.");
        }
        if (!canUserJoinHuddle(userId)) {
            throw new IllegalStateException("유저는 하나의 허들에만 참여할 수 있습니다.");
        }
    }

    public boolean canUserJoinHuddle(Long userId) {
        return huddleParticipantsRepository.getUserHuddle(userId) == null;
    }

    /**
     * 허들 퇴장
     */
    public void exitHuddle(String huddleId, Long userId) {
        if (huddleCacheRepository.getHuddleById(huddleId) == null) {
            throw new IllegalStateException("존재하지 않는 허들입니다.");
        }
    }

    /**
     * 허들 삭제 (참여자가 아무도 없을 때)
     */
    private void deleteHuddle(String huddleId) {
        Huddle huddle = huddleCacheRepository.getHuddleById(huddleId);
        if (huddle == null) {
            log.warn("허들을 찾을 수 없음: huddleId={}", huddleId);
            return;
        }

        // Redis에서 허들 삭제
        huddleCacheRepository.deleteHuddle(huddleId);

        // 채널-허들 매핑 삭제
        if (huddle.channelId() != null) {
            channelHuddleRepository.deleteChannelHuddle(huddle.channelId());
        }
    }

}
