package com.jootalkpia.chat_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.chat_server.dto.MinutePriceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {
    @KafkaListener(
            topics = "jootalkpia.stock.local.minute",
            groupId = "minute-price-save-consumer-group",
            concurrency = "2"
    )
    public void processMinutePriceMessage(String kafkaMessage) {
        log.info("message ===> " + kafkaMessage);

        ObjectMapper mapper = new ObjectMapper();

        try {
            MinutePriceResponse minutePriceResponse = mapper.readValue(kafkaMessage, MinutePriceResponse.class);
            log.info("dto ===> " + minutePriceResponse.toString());
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex);
        }
    }
}
