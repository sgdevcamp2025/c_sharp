package com.jootalkpia.stock_server.stocks.advice.exception;

public class BadRequestException extends BusinessException {

    public BadRequestException(String errorCode, String message) {
        super(errorCode, message);
    }
}
