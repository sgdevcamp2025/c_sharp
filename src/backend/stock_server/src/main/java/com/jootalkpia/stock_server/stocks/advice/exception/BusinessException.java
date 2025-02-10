package com.jootalkpia.stock_server.stocks.advice.exception;

public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
