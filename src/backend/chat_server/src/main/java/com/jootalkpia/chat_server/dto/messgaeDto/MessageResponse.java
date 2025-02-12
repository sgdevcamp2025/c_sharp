package com.jootalkpia.chat_server.dto.messgaeDto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = TextResponse.class, name = "TEXT"),
        @JsonSubTypes.Type(value = VideoResponse.class, name = "VIDEO"),
        @JsonSubTypes.Type(value = ImageResponse.class, name = "IMAGE")
})
public interface MessageResponse {
    String type();
}
