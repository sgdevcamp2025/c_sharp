package com.jootalkpia.workspace_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.workspace_server.dto.WorkspaceToKafka;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaProducer {

    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendChannelStatusMessage(WorkspaceToKafka workspaceToKafka) {
        try {
            String workspaceData = objectMapper.writeValueAsString(workspaceToKafka);
            kafkaTemplate.send("jootalkpia.workspace.prd.channel", workspaceData)
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
