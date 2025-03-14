package com.jootalkpia.workspace_server.exception.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    UNKNOWN("W00001", "알 수 없는 에러가 발생했습니다."),
    BAD_REQUEST("W40001", "잘못된 요청입니다."),
    VALIDATION_FAILED("W40002", "유효성 검증에 실패했습니다."),
    MISSING_PARAMETER("W40003", "필수 파라미터가 누락되었습니다."),
    INVALID_PARAMETER("W40004", "잘못된 파라미터가 포함되었습니다."),
    DUPLICATE_CHANNEL_NAME("W40005", "동일한 채널명이 이미 해당 워크스페이스에 존재합니다."),
    DUPLICATE_USER_IN_CHANNEL("W40006", "유저가 이미 해당 채널에 참여하고 있습니다"),

    // 404 Not Found
    WORKSPACE_NOT_FOUND("W40401", "등록되지 않은 워크스페이스입니다."),
    CHANNEL_NOT_FOUND("W40402", "등록되지 않은 채널입니다."),
    USER_NOT_FOUND("W40403", "등록되지 않은 유저입니다."),


    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR("W50001", "서버 내부 오류가 발생했습니다."),
    DATABASE_ERROR("W50002", "데이터베이스 처리 중 오류가 발생했습니다."),
    IMAGE_UPLOAD_FAILED("W50003", "파일 업로드에 실패했습니다."),
    IMAGE_DOWNLOAD_FAILED("W50004", "파일 다운로드 중 오류가 발생했습니다."),
    FILE_PROCESSING_FAILED("W50005", "파일 처리 중 오류가 발생했습니다."),
    UNEXPECTED_ERROR("W50006", "예상치 못한 오류가 발생했습니다.");

    private final String code;
    private final String msg;
}
