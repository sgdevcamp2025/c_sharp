package com.jootalkpia.chat_server.dto;

import com.jootalkpia.chat_server.dto.messgaeDto.CommonResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.MessageResponse;
import java.util.List;

public record ChatMessageToKafka(
        CommonResponse common,
        List<MessageResponse> message
) {
}
