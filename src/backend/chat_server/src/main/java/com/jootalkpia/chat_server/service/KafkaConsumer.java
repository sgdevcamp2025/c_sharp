package com.jootalkpia.chat_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.chat_server.dto.ChatMessageResponse;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
import com.jootalkpia.chat_server.dto.MinutePriceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumer {

    private final ChatService chatService;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate; // SimpMessagingTemplate 주입
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
    public void processChatMessage(String kafkaMessage) {
        log.info("Received Kafka message ===> " + kafkaMessage);

        ObjectMapper mapper = new ObjectMapper();

        try {
            ChatMessageToKafka chatMessageToKafka = mapper.readValue(kafkaMessage, ChatMessageToKafka.class);

            //로컬 메모리와 유저 ID를 비교하는 로직, 있으면 웹소켓을 통한 데이터 전달 없으면 일단 버림

            log.info("dto ===> " + chatMessageToKafka.toString());
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex);
        }
    }
}
