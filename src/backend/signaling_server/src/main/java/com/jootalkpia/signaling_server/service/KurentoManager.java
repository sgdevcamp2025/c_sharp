package com.jootalkpia.signaling_server.service;

import com.jootalkpia.signaling_server.rtc.KurentoRoom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class KurentoManager {

    private final KurentoClient kurentoClient;
    private final Map<Long, KurentoRoom> rooms = new ConcurrentHashMap<>();

    // KurentoRoom도 함께 생성
    public void createRoom(String huddleId, Long channelId) {
        if (rooms.containsKey(channelId)) {
            throw new IllegalStateException("이미 존재하는 KurentoRoom입니다.");
        }

        MediaPipeline pipeline = kurentoClient.createMediaPipeline();
        KurentoRoom room = new KurentoRoom(huddleId, pipeline);
        rooms.put(channelId, room);
    }

    public KurentoRoom getRoom(String huddleId, Long channelId) {
        return rooms.get(channelId);
    }

    public void removeRoom(String huddleId, Long channelId) {
        KurentoRoom room = rooms.remove(channelId);
        if (room != null) {
            room.closeRoom();
        }
    }

    public WebRtcEndpoint addParticipantToRoom(String huddleId, Long userId, Long channelId) {
        KurentoRoom room = rooms.get(channelId);
        if (room == null) {
            throw new IllegalStateException("존재하지 않는 KurentoRoom입니다.");
        }

        return room.addParticipant(userId);
    }

    public void removeParticipantFromRoom(String huddleId, Long userId, Long channelId) {
        if (huddleId == null || userId == null) {
            log.error("removeParticipantFromRoom() - roomId or userId is null");
            return;
        }
        KurentoRoom room = rooms.get(channelId);
        if (room != null) {
            room.removeParticipant(userId);
        }
    }
}
