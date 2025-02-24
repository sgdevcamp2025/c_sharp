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

    public void sendHurdleStatusMessage(MessageToKafka messageToKafka) { // 미르님 원하는 DTO로 변경 필수
        String jsonHurdleStatusMessage = gson.toJson(messageToKafka);

        kafkaTemplate.send("jootalkpia.huddle.prd.status", jsonHurdleStatusMessage).whenComplete((result, ex) -> {
            if (ex == null) {
                log.info(result.toString());
            } else {
                log.error(ex.getMessage(), ex); //추후 예외처리
            }
        });
    }
}
