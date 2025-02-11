package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.repository.HuddleCacheRepository;
import com.jootalkpia.signaling_server.repository.HuddleParticipantsRepository;
import com.jootalkpia.signaling_server.repository.ChannelHuddleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
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

        huddleCacheRepository.saveHuddle(huddle);
        huddleParticipantsRepository.addParticipant(huddleId, userId); // 초기 참여자 등록
        channelHuddleRepository.saveChannelHuddle(channelId, huddleId); // 채널과 허들 매핑

        return huddle;
    }

    /**
     * 허들 참가
     */
    public void joinHuddle(String huddleId, Long userId) {
        if (huddleCacheRepository.getHuddleById(huddleId) == null) {
            throw new IllegalStateException("존재하지 않는 허들입니다.");
        }

        huddleParticipantsRepository.addParticipant(huddleId, userId);
    }

    /**
     * 허들 퇴장
     */
    public void exitHuddle(String huddleId, Long userId) {
        if (huddleCacheRepository.getHuddleById(huddleId) == null) {
            throw new IllegalStateException("존재하지 않는 허들입니다.");
        }

        huddleParticipantsRepository.removeParticipant(huddleId, userId);

        // 허들에 남아있는 참여자가 없으면 삭제
        Set<Long> remainingParticipants = huddleParticipantsRepository.getParticipants(huddleId);
        if (remainingParticipants.isEmpty()) {
            deleteHuddle(huddleId);
        }
    }

    /**
     * 허들 삭제 (참여자가 아무도 없을 때)
     */
    private void deleteHuddle(String huddleId) {
        Huddle huddle = huddleCacheRepository.getHuddleById(huddleId);
        if (huddle == null) return;

        huddleCacheRepository.deleteHuddle(huddleId);
        channelHuddleRepository.deleteChannelHuddle(huddle.channelId()); // 채널 매핑 제거
    }
}
