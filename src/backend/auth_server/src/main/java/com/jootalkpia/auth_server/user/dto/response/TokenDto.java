package com.jootalkpia.auth_server.user.dto.response;

public record TokenDto(

        String accessToken,

        String refreshToken
) {

    public static TokenDto of(String accessToken, String refreshToken) {
        return new TokenDto(accessToken, refreshToken);
    }
}
