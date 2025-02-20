package com.jootalkpia.history_server.dto;

import com.jootalkpia.history_server.domain.ChatMessage;
import java.util.List;

public record ChatMessagePageResponse(
        boolean hasNext,
        Long lastMessageId,
        List<ChatMessage> messages
) {}
