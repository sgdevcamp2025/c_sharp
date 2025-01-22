package com.jootalkpia.workspace_server.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimpleChannel {
    private Long channelId;
    private String channelName;
    private LocalDateTime createdAt;
}
