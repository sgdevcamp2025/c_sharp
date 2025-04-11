package com.jootalkpia.chat_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.chat_server.dto.*;
import com.jootalkpia.chat_server.dto.WorkspaceToKafka;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumer {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(
            topics = "${topic.minute}",
            groupId = "${group.minute}"
    )
    public void processMinutePrice(String kafkaMessage) {
        log.info("Received Kafka minute message ===> {}", kafkaMessage);
        try {
            MinutePriceResponse stockUpdate = objectMapper.readValue(kafkaMessage, MinutePriceResponse.class);
            String stockDataJson = objectMapper.writeValueAsString(stockUpdate);

            messagingTemplate.convertAndSend("/subscribe/stock", stockDataJson);

            log.info("Broadcasted stock data via WebSocket: " + stockDataJson);

        } catch (Exception ex) {
            log.error("Error processing stock message: " + ex.getMessage(), ex);
        }
    }

    @KafkaListener(
            topics = "${topic.chat}",
            groupId = "${group.chat}"
    )
    public void processChatMessage(@Header(KafkaHeaders.RECEIVED_KEY) String channelId, String kafkaMessage) {
        try {
            ChatMessageToKafka chatMessage = objectMapper.readValue(kafkaMessage, ChatMessageToKafka.class);
            String chatDataJson = objectMapper.writeValueAsString(chatMessage);

            messagingTemplate.convertAndSend("/subscribe/chat." + channelId, chatDataJson);
        } catch (Exception ex) {
            log.error("Error processing chat message: {}", ex.getMessage(), ex);
        }
    }

    @KafkaListener(
            topics = "${topic.push}",
            groupId = "${group.push}"
    )
    public void processPushMessage(String kafkaMessage) {
        try {
            PushMessageToKafka pushMessageToKafka = objectMapper.readValue(kafkaMessage, PushMessageToKafka.class);
            String cleanSessionId = pushMessageToKafka.sessionId().replace("\"", "");
            String workspaceId = pushMessageToKafka.workspaceId();

            PushMessage pushMessage = PushMessage.from(pushMessageToKafka);
            ReadCountMessage readCountMessage = ReadCountMessage.from(pushMessageToKafka);

            messagingTemplate.convertAndSend("/subscribe/notification." + cleanSessionId, pushMessage);
            messagingTemplate.convertAndSend("/subscribe/notification." + cleanSessionId + "/workspace." + workspaceId, readCountMessage);
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex); // 추후에 GlobalException 처리
        }
    }

    @KafkaListener(
            topics = "${topic.huddle}",
            groupId = "${group.huddle}"
    )
    public void processHurdleStatusMessage(String kafkaMessage) {
        log.info("Received Kafka huddle message ===> {}", kafkaMessage);
        try {
            HuddleToKafka huddleData = objectMapper.readValue(kafkaMessage, HuddleToKafka.class);
            String huddleDataJson = objectMapper.writeValueAsString(huddleData);
            Long channelId = huddleData.channelId();

            messagingTemplate.convertAndSend("/subscribe/huddle." + channelId, huddleDataJson);

            log.info("Broadcasted hurdle data via WebSocket: " + huddleDataJson);

        } catch (Exception ex) {
            log.error("Error processing huddle message: " + ex.getMessage(), ex);
        }
    }

    @KafkaListener(
            topics = "${topic.workspace}",
            groupId = "${group.workspace}"
    )
    public void processChannelStatusMessage(String kafkaMessage) {
        log.info("Received Kafka workspace message ===> {}", kafkaMessage);
        try {
            WorkspaceToKafka workspaceData = objectMapper.readValue(kafkaMessage, WorkspaceToKafka.class);
            String workspaceDataJson = objectMapper.writeValueAsString(workspaceData);
            Long workspaceId = workspaceData.workspaceId();

            messagingTemplate.convertAndSend("/subscribe/workspace." + workspaceId, workspaceDataJson);

            log.info("Broadcasted workspace data via WebSocket: " + workspaceDataJson);

        } catch (Exception ex) {
            log.error("Error processing workspace message: " + ex.getMessage(), ex);
        }
    }
}