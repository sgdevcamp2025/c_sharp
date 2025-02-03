package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.model.Huddle;
import com.jootalkpia.signaling_server.repository.HuddleCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HuddleService {

    private final HuddleCacheRepository huddleCacheRepository;

    public Huddle createHuddle(Long channelId, Long userId) {
        if (huddleCacheRepository.getHuddleByChannel(channelId) != null) {
            throw new IllegalStateException("이미 해당 채널에 허들이 존재합니다.");
        }

        Set<Long> initialParticipants = new HashSet<>();
//        initialParticipants.add(userId);

        Huddle huddle = new Huddle(
                "huddle-" + System.currentTimeMillis(),
                channelId,
                userId,
                LocalDateTime.now(),
                LocalDateTime.now(),
                initialParticipants
        );

        huddleCacheRepository.saveHuddle(huddle);
        return huddle;
    }

    public Huddle joinHuddle(String huddleId, Long userId, Long channelId) {
        Huddle huddle = huddleCacheRepository.getHuddleById(huddleId);
        if (huddle == null) throw new IllegalStateException("허들이 존재하지 않습니다.");

        Huddle updatedHuddle = new Huddle(
                huddle.huddleId(),
                huddle.channelId(),
                huddle.createdByUserId(),
                huddle.createdAt(),
                LocalDateTime.now(),
                addParticipant(huddle.participants(), userId)  // 참가자 추가
        );

        huddleCacheRepository.saveHuddle(updatedHuddle);
        return updatedHuddle;
    }

    // 참가자 추가
    private Set<Long> addParticipant(Set<Long> participants, Long userId) {
        Set<Long> updatedParticipants = new HashSet<>(participants);
        updatedParticipants.add(userId);
        return updatedParticipants;
    }

    public void exitHuddle(String huddleId, Long userId, Long channelId) {
        Huddle huddle = huddleCacheRepository.getHuddleById(huddleId);
        if (huddle == null) throw new IllegalStateException("허들이 존재하지 않습니다.");

        Set<Long> updatedParticipants = new HashSet<>(huddle.participants());
        updatedParticipants.remove(userId);

        Huddle updatedHuddle = huddle.updateParticipants(updatedParticipants);
        huddleCacheRepository.saveHuddle(updatedHuddle);
    }

    public Huddle getHuddleByChannel(Long channelId) {
        return huddleCacheRepository.getHuddleByChannel(channelId);
    }
}