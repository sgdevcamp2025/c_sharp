package com.jootalkpia.workspace_server.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SimpleChannel {
    private Long channelId;
    private String channelName;
    private LocalDateTime createdAt;
    private Long unreadNum;
}
