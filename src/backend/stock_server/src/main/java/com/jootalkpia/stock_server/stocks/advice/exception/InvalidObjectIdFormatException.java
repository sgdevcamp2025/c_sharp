package com.jootalkpia.stock_server.stocks.advice.exception;

public class InvalidObjectIdFormatException extends BadRequestException {

    private static final String ERROR_CODE = "S40002";

    private static final String MESSAGE = "ObjectId는 24자리의 16진수 문자열이어야 합니다: ";

    public InvalidObjectIdFormatException(String cursorId) {
        super(ERROR_CODE, MESSAGE + cursorId);
    }
}
