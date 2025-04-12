package com.jootalkpia.state_server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumer {
    private final StateService stateService;
    private final KafkaProducer kafkaProducer;

    private static final String COMMON = "common";
    private static final String MESSAGE = "message";
    private static final String CHANNEL_ID = "channelId";
    private static final String USER_ID = "userId";

    @KafkaListener(
            topics = "${topic.chat}",
            groupId = "${group.status}"
    )
    public void processState(String kafkaMessage) {
        ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode rootNode = mapper.readTree(kafkaMessage);
            JsonNode commonNode = rootNode.get(COMMON);
            JsonNode messagesNode = rootNode.get(MESSAGE);

            String channelId = commonNode.get(CHANNEL_ID).asText();
            String userId = commonNode.get(USER_ID).asText();

            for (String sessionId : stateService.findNotificationTargets(channelId, userId)) {
                kafkaProducer.sendPushMessage(stateService.createPushMessage(commonNode, messagesNode, sessionId));
            }

        } catch (Exception ex) {
            log.error(ex.getMessage(), ex); // 추후에 GlobalException 처리
        }
    }
}
