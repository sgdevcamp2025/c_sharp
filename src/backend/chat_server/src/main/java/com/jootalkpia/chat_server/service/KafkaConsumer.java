package com.jootalkpia.chat_server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
import com.jootalkpia.chat_server.dto.MinutePriceResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaConsumer {
    @KafkaListener(
            topics = "jootalkpia.stock.local.minute",
            groupId = "minute-price-save-consumer-group"
    )
    public void processMinutePrice(String kafkaMessage) {
        log.info("message ===> " + kafkaMessage);

        ObjectMapper mapper = new ObjectMapper();

        try {
            MinutePriceResponse minutePriceResponse = mapper.readValue(kafkaMessage, MinutePriceResponse.class);

            //웹소켓 전달하는 로직 or 전달하는 함수

            log.info("dto ===> " + minutePriceResponse.toString());
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex); // 추후에 GlobalException 처리
        }
    }
}
