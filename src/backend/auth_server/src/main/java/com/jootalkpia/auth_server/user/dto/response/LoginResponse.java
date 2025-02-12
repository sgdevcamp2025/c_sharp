package com.jootalkpia.auth_server.user.dto.response;

public record LoginResponse(

        UserDto user,

        TokenDto token
) {
    public static LoginResponse of(
            final UserDto user,
            final TokenDto token
    ) {
        return new LoginResponse(user, token);
    }
}