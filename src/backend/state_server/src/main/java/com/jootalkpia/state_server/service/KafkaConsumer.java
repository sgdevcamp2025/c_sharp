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

    @KafkaListener(
            topics = "${topic.chat}",
            groupId = "${group.status}"
    )
    public void processState(String kafkaMessage) {
        log.info("message ===> " + kafkaMessage);

        ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode rootNode = mapper.readTree(kafkaMessage);
            JsonNode commonNode = rootNode.get("common");
            JsonNode messagesNode = rootNode.get("message");

            stateService.findNotificationTargets(commonNode.get("channelId").asText());

        } catch (Exception ex) {
            log.error(ex.getMessage(), ex); // 추후에 GlobalException 처리
        }
    }
}
