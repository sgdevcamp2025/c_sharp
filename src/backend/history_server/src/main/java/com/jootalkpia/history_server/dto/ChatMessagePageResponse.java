package com.jootalkpia.history_server.dto;

import java.util.List;

public record ChatMessagePageResponse(
        boolean hasNext,
        Long lastMessageId,
        List<ChatMessageDto> messages
) {}

