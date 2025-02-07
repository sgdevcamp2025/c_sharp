package com.jootalkpia.state_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.state_server.ChatMessageToKafka;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaConsumer {

    @KafkaListener(
            topics = "${topic.chat}",
            groupId = "${group.status}"
    )
    public void processState(String kafkaMessage) {
        log.info("message ===> " + kafkaMessage);

        ObjectMapper mapper = new ObjectMapper();

        try {
            ChatMessageToKafka chatMessageToKafka = mapper.readValue(kafkaMessage, ChatMessageToKafka.class);

            // 유저 상태 검증 로직

            log.info("dto ===> " + chatMessageToKafka.toString());
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex); // 추후에 GlobalException 처리
        }
    }
}
