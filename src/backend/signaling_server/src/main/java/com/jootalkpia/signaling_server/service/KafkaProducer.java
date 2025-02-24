package com.jootalkpia.signaling_server.service;

import com.google.gson.Gson;
import com.jootalkpia.signaling_server.model.MessageToKafka;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaProducer {
    private final Gson gson = new Gson();
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendHuddleStatusMessage(MessageToKafka messageToKafka) {
        String jsonHuddleStatusMessage = gson.toJson(messageToKafka);

        kafkaTemplate.send("jootalkpia.huddle.prd.status", jsonHuddleStatusMessage).whenComplete((result, ex) -> {
            if (ex == null) {
                log.info(result.toString());
            } else {
                log.error(ex.getMessage(), ex); //추후 예외처리
            }
        });

        log.info("message to kafka for channelId {} sent! ", messageToKafka.channelId(), messageToKafka.status());
    }
}
