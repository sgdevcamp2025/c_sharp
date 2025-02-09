package com.jootalkpia.auth_server.user.dto.response;

public record LoginSuccessResponse(

        UserDto user,

        TokenDto token
) {
    public static LoginSuccessResponse of(
            final UserDto user,
            final TokenDto token
    ) {
        return new LoginSuccessResponse(user, token);
    }
}