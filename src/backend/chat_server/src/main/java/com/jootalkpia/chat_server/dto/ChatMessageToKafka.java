package com.jootalkpia.chat_server.dto;

import com.jootalkpia.chat_server.dto.messgaeDto.MessageResponse;
import java.util.List;

public record ChatMessageToKafka(
        MessageResponse common,
        List message    //type 건들지말것
) {
}
