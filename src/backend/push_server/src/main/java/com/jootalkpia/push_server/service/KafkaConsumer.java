package com.jootalkpia.push_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.push_server.dto.ChatMessageToKafka;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaConsumer {

    @KafkaListener(
            topics = "${topic.push}",
            groupId = "${group.push}"
    )
    public void processState(String kafkaMessage) {
        log.info("message ===> " + kafkaMessage);

        ObjectMapper mapper = new ObjectMapper();

        try {
            ChatMessageToKafka chatMessageToKafka = mapper.readValue(kafkaMessage, ChatMessageToKafka.class); //추후 DTO 변경 필수

            // FCM으로 메시지 전달하는 로직

            log.info("dto ===> " + chatMessageToKafka.toString());
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex); // 추후에 GlobalException 처리
        }
    }
}
