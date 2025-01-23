package com.jootalkpia.auth_server.response;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.jootalkpia.auth_server.response.ErrorCode;
import lombok.Builder;
import lombok.NonNull;
import org.springframework.http.HttpStatus;

@Builder
public record ApiResponseDto<T> (
        @JsonIgnore HttpStatus httpStatus,
        String code ,
        @NonNull String message
){
    public static <T> ApiResponseDto<T> fail(final ErrorCode errorCode) {
        return ApiResponseDto.<T>builder()
                .httpStatus(errorCode.getHttpStatus())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
    }
}
