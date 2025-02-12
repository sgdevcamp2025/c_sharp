package com.jootalkpia.stock_server.stocks.advice.exception;

public class InvalidMinutePriceFromApiException extends RuntimeException {

    private static final String ERROR_CODE = "S50001";
    private static final String MESSAGE = "한국 투자 API로부터 응답 받은 데이터가 없습니다. 1분 후에 다시 시도하세요.";

    private final String errorCode;

    public InvalidMinutePriceFromApiException() {
        super(MESSAGE);
        this.errorCode = ERROR_CODE;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
