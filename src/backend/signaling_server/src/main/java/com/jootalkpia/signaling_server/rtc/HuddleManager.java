package com.jootalkpia.signaling_server.rtc;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.KurentoClient;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class HuddleManager {

    private final KurentoClient kurento;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentMap<Long, Huddle> channelIds = new ConcurrentHashMap<>();


    public Huddle getHuddle(Long channelId) {
        log.debug("Searching for channelId {}", channelId);
        Huddle huddle = channelIds.get(channelId);

        if (huddle == null) {
            log.debug("channelId {} not existent. Will create now!", channelId);
            huddle = new Huddle(channelId, kurento.createMediaPipeline(), messagingTemplate);
            channelIds.put(channelId, huddle);
        }
        log.debug("channelId {} found!", channelId);
        return huddle;
    }

    public void removeHuddle(Huddle huddle) {
        this.channelIds.remove(huddle.getChannelId());
        huddle.close();
        log.info("channelId {} removed and closed", huddle.getChannelId());
    }

}