package com.jootalkpia.workspace_server.exception.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CustomException extends RuntimeException {

    private final ErrorCode code;

    public CustomException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }
}
