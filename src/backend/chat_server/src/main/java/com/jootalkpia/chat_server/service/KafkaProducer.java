package com.jootalkpia.chat_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaProducer {

    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${topic.chat}")
    private String topicChat;

    public void sendChatMessage(ChatMessageToKafka chatMessageToKafka, Long channelId) {
        try {
            String partitionNumber = String.valueOf(ThreadLocalRandom.current().nextInt(0, 3));
            String jsonChatMessage = objectMapper.writeValueAsString(chatMessageToKafka);

            ProducerRecord<String, String> record =
                    new ProducerRecord<>(topicChat, partitionNumber, jsonChatMessage);

            kafkaTemplate.send(record)
                    .whenComplete((result, ex) -> { //키 값 설정으로 순서 보장, 실시간성이 떨어짐, 고민해봐야 할 부분
                        if (ex == null) {
                            log.info("Kafka message sent: {}", result.toString());
                        } else {
                            log.error("Error sending Kafka message: {}", ex.getMessage(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("Error serializing chat message: {}", e.getMessage(), e);
        }
    }
}
