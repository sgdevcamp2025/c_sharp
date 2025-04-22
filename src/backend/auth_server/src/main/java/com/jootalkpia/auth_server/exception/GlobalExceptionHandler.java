package com.jootalkpia.auth_server.exception;

import com.jootalkpia.auth_server.response.ApiResponseDto;
import com.jootalkpia.auth_server.response.ErrorCode;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.codec.DecodingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.MissingRequestValueException;
import reactor.core.publisher.Mono;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * @Valid 또는 @Validated에서 바인딩 실패 시 발생
     */
    @ExceptionHandler(WebExchangeBindException.class)
    public Mono<ResponseEntity<ApiResponseDto<?>>> handleWebExchangeBindException(WebExchangeBindException e) {
        log.warn("📛 WebExchangeBindException: {}", e.getMessage());
        ApiResponseDto<?> response = ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        return Mono.just(ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response));
    }

    /**
     * PathVariable, RequestParam 타입 불일치
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public Mono<ResponseEntity<ApiResponseDto<?>>> handleConstraintViolationException(ConstraintViolationException e) {
        log.warn("📛 ConstraintViolationException: {}", e.getMessage());
        ApiResponseDto<?> response = ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        return Mono.just(ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response));
    }

    /**
     * JSON 파싱 실패 등 메시지 매핑 오류
     */
    @ExceptionHandler(DecodingException.class)
    public Mono<ResponseEntity<ApiResponseDto<?>>> handleDecodingException(DecodingException e) {
        log.warn("📛 DecodingException: {}", e.getMessage());
        ApiResponseDto<?> response = ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        return Mono.just(ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response));
    }

    /**
     * WebFlux에서 일반적인 잘못된 요청 처리
     */
    @ExceptionHandler(ErrorResponseException.class)
    public Mono<ResponseEntity<ApiResponseDto<?>>> handleErrorResponseException(ErrorResponseException e) {
        log.warn("📛 ErrorResponseException: {}", e.getMessage());
        ApiResponseDto<?> response = ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        return Mono.just(ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response));
    }

    /**
     * 사용자 정의 예외 처리
     */
    @ExceptionHandler(CustomException.class)
    public Mono<ResponseEntity<ApiResponseDto<?>>> handleCustomException(CustomException e) {
        log.error("❌ CustomException: {}", e.getMessage());
        ApiResponseDto<?> response = ApiResponseDto.fail(e.getErrorCode());
        log.error("❌ CustomException: {}", response);
        return Mono.just(ResponseEntity
                .status(e.getHttpStatus())
                .body(response));
    }

    /**
     * 처리되지 않은 기타 모든 예외
     */
    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<ApiResponseDto<?>>> handleException(Exception e) {
        log.error("❌ Unhandled Exception: {} - {}", e.getClass(), e.getMessage(), e);
        ApiResponseDto<?> response = ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        return Mono.just(ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response));
    }

    @ExceptionHandler(MissingRequestValueException.class)
    public Mono<ResponseEntity<ApiResponseDto<?>>> handleMissingRequestValue(MissingRequestValueException e) {
        log.warn("📛 MissingRequestValueException: {}", e.getMessage());
        ApiResponseDto<?> response = ApiResponseDto.fail(ErrorCode.MISSING_REQUIRED_PARAMETER);
        return Mono.just(ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response));
    }
}
