package com.jootalkpia.chat_server.dto;

import com.jootalkpia.chat_server.dto.messgaeDto.CommonResponse;
import java.util.List;

public record ChatMessageToKafka(
        CommonResponse common,
        List message    //type 건들지말것
) {
}
