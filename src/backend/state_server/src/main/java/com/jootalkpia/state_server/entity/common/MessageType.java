package com.jootalkpia.state_server.entity.common;

import com.fasterxml.jackson.databind.JsonNode;

public enum MessageType {
    TEXT {
        @Override
        public String createText(JsonNode messageNode) {
            return messageNode.get("text").asText();
        }
    },
    IMAGE {
        @Override
        public String createText(JsonNode messageNode) {
            return "파일을 공유함" + messageNode.get("imageUrl");
        }
    },
    VIDEO {
        @Override
        public String createText(JsonNode messageNode) {
            return "동영상을 공유함" + messageNode.get("videoId");
        }
    };

    public abstract String createText(JsonNode messageNode);

    public static MessageType from(String type) {
        try {
            return MessageType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("지원하지 않는 메시지 타입입니다: ");
        }
    }
}
