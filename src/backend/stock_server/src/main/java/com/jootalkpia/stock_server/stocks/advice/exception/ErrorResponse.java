package com.jootalkpia.stock_server.stocks.advice.exception;

public record ErrorResponse(
        String errorCode,
        String message) {
}
