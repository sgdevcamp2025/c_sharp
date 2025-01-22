package com.jootalkpia.auth_server.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // 400 Bad Request
    ENUM_VALUE_BAD_REQUEST("40000", HttpStatus.BAD_REQUEST, "요청한 값이 유효하지 않습니다."),
    BAD_REQUEST("40004", HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    MISSING_REQUIRED_HEADER("40005", HttpStatus.BAD_REQUEST, "필수 헤더가 누락되었습니다."),
    MISSING_REQUIRED_PARAMETER("40006", HttpStatus.BAD_REQUEST, "필수 파라미터가 누락되었습니다."),

    // 401 Unauthorized

    //403 Forbidden

    // 404 Not Found
    NOT_FOUND_END_POINT("40400", HttpStatus.NOT_FOUND, "존재하지 않는 API입니다."),

    // 405 Method Not Allowed Error
    METHOD_NOT_ALLOWED("40500", HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 메소드입니다."),

    // 422 Unprocessable Entity

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR("50000", HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류입니다."),

    ;

    private final String code;
    private final HttpStatus httpStatus;
    private final String message;
}
