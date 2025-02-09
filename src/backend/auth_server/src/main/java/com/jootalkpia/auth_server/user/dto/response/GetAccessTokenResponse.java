package com.jootalkpia.auth_server.user.dto.response;

public record GetAccessTokenResponse(

        String accessToken
) {
    public static GetAccessTokenResponse of(
            final String accessToken
    ) {
        return new GetAccessTokenResponse(accessToken);
    }
}