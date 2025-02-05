package com.jootalkpia.auth_server.user.dto.response;

public record AccessTokenGetSuccess(

        String accessToken
) {
    public static AccessTokenGetSuccess of(
            final String accessToken
    ) {
        return new AccessTokenGetSuccess(accessToken);
    }
}