package com.jootalkpia.chat_server.dto.messgaeDto;

import java.util.List;

public record ChatMessageRequest(
        Long userId,
        String content,
        List<Long> attachmentList
) {
}
