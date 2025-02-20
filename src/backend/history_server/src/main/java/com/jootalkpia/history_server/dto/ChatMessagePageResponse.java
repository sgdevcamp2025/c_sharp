package com.jootalkpia.history_server.dto;

import java.util.List;

public record ChatMessagePageResponse(
        boolean hasNext,
        Long lastCursorId,
        List<ThreadDto> threads
) {}

