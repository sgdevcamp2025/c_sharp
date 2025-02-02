package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.repository.HuddleCacheRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HuddleService {

    private final HuddleCacheRepository huddleCacheRepository;

    public Huddle createHuddle(Long channelId, Long userId) {
        if (huddleCacheRepository.getHuddleByChannel(channelId) != null) {
            throw new IllegalStateException("이미 해당 채널에 허들이 존재합니다.");
        }

        // 허들 생성 및 저장
        Huddle huddle = new Huddle();
        huddle.setHuddleId("huddle-" + System.currentTimeMillis());
        huddle.setChannelId(channelId);
        huddle.setCreatedByUserId(userId);
        huddle.setCreatedAt(LocalDateTime.now());
        huddle.setUpdatedAt(LocalDateTime.now());
        huddle.getParticipants().add(userId);

        huddleCacheRepository.saveHuddle(huddle);

        return huddle;
    }

    public Huddle joinHuddle(String huddleId, Long userId, Long channelId) {
        Huddle huddle = huddleCacheRepository.getHuddleById(huddleId);
        if (huddle == null) throw new IllegalStateException("허들이 존재하지 않습니다.");

        huddle.getParticipants().add(userId);
        huddle.setUpdatedAt(LocalDateTime.now());
        huddleCacheRepository.saveHuddle(huddle);

        return huddle;
    }

    public void exitHuddle(String huddleId, Long userId, Long channelId) {
        Huddle huddle = huddleCacheRepository.getHuddleById(huddleId);
        if (huddle == null) throw new IllegalStateException("허들이 존재하지 않습니다.");

        // 유저 제거
        Set<Long> participants = huddle.getParticipants();
        participants.remove(userId);

        huddle.setParticipants(participants);
        huddle.setUpdatedAt(LocalDateTime.now());
    }

    public Huddle getHuddleByChannel(Long channelId) {
        return huddleCacheRepository.getHuddleByChannel(channelId);
    }

}
