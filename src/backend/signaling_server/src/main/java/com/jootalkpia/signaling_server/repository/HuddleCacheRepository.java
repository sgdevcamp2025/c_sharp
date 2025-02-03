package com.jootalkpia.signaling_server.repository;

import com.jootalkpia.signaling_server.model.Huddle;
import org.springframework.stereotype.Repository;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class HuddleCacheRepository {
    private final Map<String, Huddle> huddlesById = new ConcurrentHashMap<>();
    private final Map<Long, String> channelToHuddleMap = new ConcurrentHashMap<>();

    public void saveHuddle(Huddle huddle) {
        huddlesById.put(huddle.huddleId(), huddle);
        channelToHuddleMap.put(huddle.channelId(), huddle.huddleId());
    }

    public Huddle getHuddleById(String huddleId) {
        return huddlesById.get(huddleId);
    }

    public Huddle getHuddleByChannel(Long channelId) {
        String huddleId = channelToHuddleMap.get(channelId);
        return huddleId != null ? huddlesById.get(huddleId) : null;
    }

    public void deleteHuddle(String huddleId) {
        Huddle huddle = huddlesById.remove(huddleId);
        if (huddle != null) {
            channelToHuddleMap.remove(huddle.channelId());
        }
    }
}