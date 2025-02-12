package com.jootalkpia.state_server.service;

import com.google.gson.Gson;
import com.jootalkpia.state_server.ChatMessageToKafka;
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

    public void sendPushMessage(ChatMessageToKafka chatMessageToKafka) { // DTO 변경 필요
        String jsonChatMessage = gson.toJson(chatMessageToKafka);
        kafkaTemplate.send("jootalkpia.push.prd.message", jsonChatMessage).whenComplete((result, ex) -> {
            if (ex == null) {
                log.info(result.toString());
            } else {
                log.error(ex.getMessage(), ex); //추후 예외처리
            }
        });
    }
}
