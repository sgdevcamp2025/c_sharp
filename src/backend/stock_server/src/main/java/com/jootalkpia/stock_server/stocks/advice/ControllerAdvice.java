package com.jootalkpia.stock_server.stocks.advice;

import com.jootalkpia.stock_server.stocks.advice.exception.BadRequestException;
import com.jootalkpia.stock_server.stocks.advice.exception.ErrorResponse;
import com.jootalkpia.stock_server.stocks.advice.exception.InvalidMinutePriceFromApiException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ControllerAdvice {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(BadRequestException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler(InvalidMinutePriceFromApiException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(InvalidMinutePriceFromApiException e) {
        return ResponseEntity.internalServerError().body(new ErrorResponse(e.getErrorCode(), e.getMessage()));
    }
}
