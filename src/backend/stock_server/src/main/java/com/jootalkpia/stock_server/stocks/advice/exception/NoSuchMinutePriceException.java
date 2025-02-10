package com.jootalkpia.stock_server.stocks.advice.exception;

public class NoSuchMinutePriceException extends BadRequestException {

    private static final String MESSAGE = "조회된 분봉 데이터가 없습니다.";

    public NoSuchMinutePriceException() {
        super(MESSAGE);
    }
}
