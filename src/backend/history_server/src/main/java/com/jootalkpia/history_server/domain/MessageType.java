package com.jootalkpia.history_server.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MessageType {

    TEXT,

    IMAGE,

    HUDDLE,

    VIDEO,
    ;
}
