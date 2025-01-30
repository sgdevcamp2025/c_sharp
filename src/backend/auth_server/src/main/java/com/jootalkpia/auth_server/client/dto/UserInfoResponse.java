package com.jootalkpia.auth_server.client.dto;


import com.jootalkpia.auth_server.user.domain.SocialType;

public record UserInfoResponse(
        Long socialId,
        SocialType socialType,
        String email,
        String socialNickname
) {
    public static UserInfoResponse of(
            final Long socialId,
            final SocialType socialType,
            final String email,
            final String socialNickname
    ) {
        return new UserInfoResponse(socialId, socialType, email, socialNickname);
    }
}
