package com.jootalkpia.signaling_server.model;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;

public record Huddle(
        String huddleId,
        Long channelId,
        Long createdByUserId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Set<Long> participants
) {
    public Huddle {
        if (participants == null) {
            participants = Collections.emptySet();
        }
    }

    public Huddle updateParticipants(Set<Long> newParticipants) {
        return new Huddle(this.huddleId, this.channelId, this.createdByUserId, this.createdAt, LocalDateTime.now(), newParticipants);
    }
}
