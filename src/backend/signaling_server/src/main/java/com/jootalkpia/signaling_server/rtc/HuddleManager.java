package com.jootalkpia.signaling_server.rtc;

import com.jootalkpia.signaling_server.model.MessageToKafka;
import com.jootalkpia.signaling_server.service.KafkaProducer;
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
    private final ConcurrentMap<Long, Huddle> huddles = new ConcurrentHashMap<>();
    private final KafkaProducer kafkaProducer;

    public Huddle getHuddle(Long channelId) {
        log.debug("Searching for channelId {}", channelId);
        Huddle huddle = huddles.get(channelId);

        if (huddle == null) {
            log.debug("channelId {} not existent. Will create now!", channelId);
            huddle = new Huddle(channelId, kurento.createMediaPipeline(), messagingTemplate);

            MessageToKafka messageToKafka = new MessageToKafka(channelId, "on");
            kafkaProducer.sendHuddleStatusMessage(messageToKafka);

            huddles.put(channelId, huddle);
        }
        log.debug("channelId {} found!", channelId);
        return huddle;
    }

    public boolean getHuddleStatus(Long channelId) {
        if (huddles.get(channelId) != null) {
            return true;
        }
        return false;
    }

    public void removeHuddle(Huddle huddle) {
        this.huddles.remove(huddle.getChannelId());
        huddle.close();
        log.info("channelId {} removed and closed", huddle.getChannelId());
    }

}