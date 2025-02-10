package com.jootalkpia.chat_server.dto;

import java.util.List;

public record ChatMessageToKafka(
        Long channelId,
        List chatMessage    //type 건들지말것
) {
}
