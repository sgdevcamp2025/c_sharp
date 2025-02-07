package com.jootalkpia.history_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.history_server.dto.ChatMessageSaveRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {

    private final HistoryCommandService historyCommandService;

    @KafkaListener(
            topics = "${topic.chat}",
            groupId = "${group.history}"
    )
    public void processChatMessage(String kafkaMessage) {
        log.info("message ===> " + kafkaMessage);

        ObjectMapper mapper = new ObjectMapper();

        try {
            ChatMessageSaveRequest chatMessageSaveRequest = mapper.readValue(kafkaMessage, ChatMessageSaveRequest.class); //메시지 DTO 변경, 임시 DTO
            historyCommandService.saveChatMessage(chatMessageSaveRequest.toDocument());

            log.info("dto ===> " + chatMessageSaveRequest);
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex);
        }
    }
}
