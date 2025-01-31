package com.jootalkpia.auth_server.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // 400 Bad Request
    ENUM_VALUE_BAD_REQUEST("A40000", HttpStatus.BAD_REQUEST, "요청한 값이 유효하지 않습니다."),
    BAD_REQUEST("A40001", HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    MISSING_REQUIRED_HEADER("A40002", HttpStatus.BAD_REQUEST, "필수 헤더가 누락되었습니다."),
    MISSING_REQUIRED_PARAMETER("A40003", HttpStatus.BAD_REQUEST, "필수 파라미터가 누락되었습니다."),
    AUTHENTICATION_CODE_EXPIRED("A40004", HttpStatus.BAD_REQUEST, "인가 코드가 만료되었습니다."),
    PLATFORM_BAD_REQUEST("A40005", HttpStatus.BAD_REQUEST, "로그인 요청이 유효하지 않습니다."),

    // 401 Unauthorized
    ACCESS_TOKEN_EXPIRED("A40100", HttpStatus.UNAUTHORIZED, "액세스 토큰이 만료되었습니다."),
    REFRESH_TOKEN_EXPIRED("A40101", HttpStatus.UNAUTHORIZED, "리프레시 토큰이 만료되었습니다."),
    TOKEN_INCORRECT_ERROR("A40102", HttpStatus.UNAUTHORIZED, "리프레시 토큰이 유효하지 않습니다."),
    EMPTY_PRINCIPAL("A40103", HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND("A40104", HttpStatus.UNAUTHORIZED, "해당 유저의 리프레시 토큰이 존재하지 않습니다."),


    //403 Forbidden

    // 404 Not Found
    NOT_FOUND_END_POINT("A40400", HttpStatus.NOT_FOUND, "존재하지 않는 API입니다."),
    USER_NOT_FOUND("A40401", HttpStatus.NOT_FOUND, "해당 유저는 존재하지 않습니다."),

    // 405 Method Not Allowed Error
    METHOD_NOT_ALLOWED("A40500", HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 메소드입니다."),

    // 422 Unprocessable Entity

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR("A50000", HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류입니다."),

    ;

    private final String code;
    private final HttpStatus httpStatus;
    private final String message;
}
