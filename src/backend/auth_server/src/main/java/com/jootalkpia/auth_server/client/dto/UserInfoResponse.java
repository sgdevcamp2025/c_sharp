package com.jootalkpia.auth_server.client.dto;


import com.jootalkpia.auth_server.user.domain.Platform;

public record UserInfoResponse(
        Long socialId,
        Platform platform,
        String email,
        String socialNickname
) {
    public static UserInfoResponse of(
            final Long socialId,
            final Platform platform,
            final String email,
            final String socialNickname
    ) {
        return new UserInfoResponse(socialId, platform, email, socialNickname);
    }
}
