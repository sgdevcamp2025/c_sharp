package com.jootalkpia.auth_server.user.dto.response;

public record UpdateNicknameResponse(

        Long userId,

        String nickname,

        String profileImage
) {
    public static UpdateNicknameResponse of(Long userId, String nickname, String profileImage) {
        return new UpdateNicknameResponse(userId, nickname, profileImage);
    }
}
