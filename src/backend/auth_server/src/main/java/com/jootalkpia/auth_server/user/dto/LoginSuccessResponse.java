package com.jootalkpia.auth_server.user.dto;

public record LoginSuccessResponse(

        Long userId,

        String nickname,

        TokenDto token
) {
    public static LoginSuccessResponse of(
            final String nickname,
            final Long userId,
            final TokenDto token
    ) {
        return new LoginSuccessResponse(userId, nickname, token);
    }
}