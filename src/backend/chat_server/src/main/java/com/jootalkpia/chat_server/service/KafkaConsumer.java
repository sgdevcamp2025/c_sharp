package com.jootalkpia.chat_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
import com.jootalkpia.chat_server.dto.MinutePriceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumer {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final SimpMessageSendingOperations messagingTemplateBroker; // 내부 메시지 브로커 사용

    @KafkaListener(
            topics = "${topic.minute}",
            groupId = "${group.minute}"
    )
    public void processMinutePrice(String kafkaMessage) {
        log.info("Received Kafka message ===> " + kafkaMessage);
        try {
            MinutePriceResponse stockUpdate = objectMapper.readValue(kafkaMessage, MinutePriceResponse.class);
            String stockDataJson = objectMapper.writeValueAsString(stockUpdate);

            messagingTemplateBroker.convertAndSend("/subscribe/stock", stockDataJson);

            log.info("Broadcasted stock data via WebSocket: " + stockDataJson);

        } catch (Exception ex) {
            log.error("Error processing stock message: " + ex.getMessage(), ex);
        }
    }

    @KafkaListener(
            topics = "${topic.chat}",
            groupId = "${group.chat}", //추후 그룹 ID에 동적인 컨테이너 ID 삽입
            concurrency = "2"
    )
    public void processChatMessage(@Header(KafkaHeaders.RECEIVED_KEY) String channelId, String kafkaMessage) {
        log.info("Received Kafka message ===> channelId: {}, message: {}", channelId, kafkaMessage);
        try {
            ChatMessageToKafka chatMessage = objectMapper.readValue(kafkaMessage, ChatMessageToKafka.class);
            String chatDataJson = objectMapper.writeValueAsString(chatMessage);

            // to do : 로컬 메모리와 유저 ID를 비교하는 로직 추가 필요
            messagingTemplate.convertAndSend("/subscribe/chat." + channelId, chatDataJson);
            log.info("Broadcasted chat message via WebSocket: {}", chatDataJson);

        } catch (Exception ex) {
            log.error("Error processing chat message: {}", ex.getMessage(), ex);
        }
    }
}
