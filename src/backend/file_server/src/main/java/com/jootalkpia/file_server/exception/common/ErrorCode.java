package com.jootalkpia.file_server.exception.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    UNKNOWN("F00001", "알 수 없는 에러가 발생했습니다."),
    BAD_REQUEST("F40001", "잘못된 요청입니다."),
    VALIDATION_FAILED("F40002", "유효성 검증에 실패했습니다."),
    MISSING_PARAMETER("F40003", "필수 파라미터가 누락되었습니다."),
    INVALID_PARAMETER("F40004", "잘못된 파라미터가 포함되었습니다."),
    MISSING_FILES("F40005", "파일이 포함되어야 합니다."),

    // 404 Not Found
    WORKSPACE_NOT_FOUND("F40401", "등록되지 않은 워크스페이스입니다."),
    CHANNEL_NOT_FOUND("F40402", "등록되지 않은 채널입니다."),
    USER_NOT_FOUND("F40403", "등록되지 않은 유저입니다."),
    FILE_NOT_FOUND("F40404", "등록되지 않은 파일입니다."),

    // 415 Unsupported Type
    UNSUPPORTED_FILE_TYPE("F41501", "지원되지 않는 파일 타입입니다."),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR("F50001", "서버 내부 오류가 발생했습니다."),
    DATABASE_ERROR("F50002", "데이터베이스 처리 중 오류가 발생했습니다."),
    IMAGE_UPLOAD_FAILED("F50003", "파일 업로드에 실패했습니다."),
    IMAGE_DOWNLOAD_FAILED("F50004", "파일 다운로드 중 오류가 발생했습니다."),
    FILE_PROCESSING_FAILED("F50005", "파일 처리 중 오류가 발생했습니다."),
    UNEXPECTED_ERROR("F50006", "예상치 못한 오류가 발생했습니다.");

    private final String code;
    private final String msg;
}
