package com.jootalkpia.auth_server.client.dto;

import com.jootalkpia.auth_server.user.domain.Platform;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserLoginRequest(
        @NotNull(message = "소셜 로그인 종류가 입력되지 않았습니다.")
        @Schema(description = "소셜로그인 타입", example = "KAKAO")
        Platform platform,

        @NotBlank(message = "redirectUri가 입력되지 않았습니다.")
        @Schema(description = "리다이텍트 uri 값", example = "http://localhost:5173/kakao/redirection")
        String redirectUri
) {
}
