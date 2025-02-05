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
            topics = "${topic.minute}",
            groupId = "${group.minute}"
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

    @KafkaListener(
            topics = "${topic.chat}",
            groupId = "${group.chat}", //추후 그룹 ID에 동적인 컨테이너 ID 삽입
            concurrency = "2"
    )
    public void processChatMessage(String kafkaMessage) {
        log.info("message ===> " + kafkaMessage);

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
