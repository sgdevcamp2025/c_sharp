package com.jootalkpia.signaling_server.exception.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    UNKNOWN("R00001", "알 수 없는 에러가 발생했습니다."),
    BAD_REQUEST("R40001", "잘못된 요청입니다."),
    VALIDATION_FAILED("R40002", "유효성 검증에 실패했습니다."),
    MISSING_PARAMETER("R40003", "필수 파라미터가 누락되었습니다."),
    INVALID_PARAMETER("R40004", "잘못된 파라미터가 포함되었습니다."),

    // 404 Not Found
    WORKSPACE_NOT_FOUND("R40401", "등록되지 않은 워크스페이스입니다."),
    CHANNEL_NOT_FOUND("R40402", "등록되지 않은 채널입니다."),
    USER_NOT_FOUND("R40403", "등록되지 않은 유저입니다."),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR("R50001", "서버 내부 오류가 발생했습니다."),
    REDIS_ERROR("R50002", "Redis 처리 중 오류가 발생했습니다."),
    REDIS_SAVE_ERROR("R50003", "Redis에 저장 중 오류가 발생했습니다."),
    REDIS_DELETE_ERROR("R50004", "Redis에 삭제 중 오류가 발생했습니다."),
    UNEXPECTED_ERROR("R50006", "예상치 못한 오류가 발생했습니다.");

    private final String code;
    private final String msg;
}