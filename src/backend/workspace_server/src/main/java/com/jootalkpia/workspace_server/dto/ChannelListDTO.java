package com.jootalkpia.workspace_server.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChannelListDTO {
    private List<SimpleChannel> joinedChannels;
    private List<SimpleChannel> unjoinedChannels;
}
