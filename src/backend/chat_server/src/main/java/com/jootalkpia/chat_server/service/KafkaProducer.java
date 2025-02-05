package com.jootalkpia.chat_server.service;

import com.google.gson.Gson;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
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

    public void sendChatMessage(ChatMessageToKafka chatMessageToKafka, Long roomId) {
        String jsonChatMessage = gson.toJson(chatMessageToKafka);
        kafkaTemplate.send("${topic.chat}", String.valueOf(roomId), jsonChatMessage).whenComplete((result, ex) -> { //키 값 설정으로 순서 보장, 실시간성이 떨어짐, 고민해봐야 할 부분
            if (ex == null) {
                log.info(result.toString());
            } else {
                log.error(ex.getMessage(), ex); //추후 예외처리
            }
        });
    }
}
