package com.jootalkpia.auth_server.exception;

import com.jootalkpia.auth_server.response.ApiResponseDto;
import com.jootalkpia.auth_server.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    @ExceptionHandler(value = {MethodArgumentNotValidException.class})
    public ResponseEntity<ApiResponseDto<?>> handlerMethodArgumentNotValidException(Exception e) {
        log.error(
                "handlerMethodArgumentNotValidException() in GlobalExceptionHandler throw MethodArgumentNotValidException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.fail(ErrorCode.BAD_REQUEST));
    }

    @ExceptionHandler(value = {MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponseDto<?>> handlerMethodArgumentTypeMismatchException(Exception e) {
        log.error(
                "handlerMethodArgumentTypeMismatchException() in GlobalExceptionHandler throw MethodArgumentTypeMismatchException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.fail(ErrorCode.BAD_REQUEST));
    }

    @ExceptionHandler(value = {HandlerMethodValidationException.class})
    public ResponseEntity<ApiResponseDto<?>> handlerHandlerMethodValidationException(Exception e) {
        log.error(
                "handlerHandlerMethodValidationException() in GlobalExceptionHandler throw HandlerMethodValidationException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.fail(ErrorCode.BAD_REQUEST));
    }

    @ExceptionHandler(value = {MissingRequestHeaderException.class})
    public ResponseEntity<ApiResponseDto<?>> handlerMissingRequestHeaderException(Exception e) {
        log.error(
                "handlerMissingRequestHeaderException() in GlobalExceptionHandler throw MissingRequestHeaderException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.fail(ErrorCode.MISSING_REQUIRED_HEADER));
    }

    @ExceptionHandler(value = {MissingServletRequestParameterException.class})
    public ResponseEntity<ApiResponseDto<?>> handlerMissingServletRequestParameterException(Exception e) {
        log.error(
                "handlerMissingServletRequestParameterException() in GlobalExceptionHandler throw MissingServletRequestParameterException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.fail(ErrorCode.MISSING_REQUIRED_PARAMETER));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponseDto<?>> handleMessageNotReadableException(HttpMessageNotReadableException e) {
        log.error(
                "handleMessageNotReadableException() in GlobalExceptionHandler throw HttpMessageNotReadableException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.fail(ErrorCode.BAD_REQUEST));
    }

    @ExceptionHandler(value = {NoHandlerFoundException.class})
    public ResponseEntity<ApiResponseDto<?>> handleNoPageFoundException(Exception e) {
        log.error("handleNoPageFoundException() in GlobalExceptionHandler throw NoHandlerFoundException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDto.fail(ErrorCode.NOT_FOUND_END_POINT));
    }

    @ExceptionHandler(value = {HttpRequestMethodNotSupportedException.class})
    public ResponseEntity<ApiResponseDto<?>> handleMethodNotSupportedException(Exception e) {
        log.error(
                "handleMethodNotSupportedException() in GlobalExceptionHandler throw HttpRequestMethodNotSupportedException : {}",
                e.getMessage());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponseDto.fail(ErrorCode.METHOD_NOT_ALLOWED));
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponseDto<?>> handleCustomException(CustomException e) {
        log.error("handleException() in GlobalExceptionHandler throw BusinessException : {}", e.getMessage());
        return ResponseEntity.status(e.getHttpStatus())
                .body(ApiResponseDto.fail(e.getErrorCode()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDto<?>> handlerException(Exception e) {
        log.error("handlerException() in GlobalExceptionHandler throw Exception : {} {}", e.getClass(), e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR));
    }
}