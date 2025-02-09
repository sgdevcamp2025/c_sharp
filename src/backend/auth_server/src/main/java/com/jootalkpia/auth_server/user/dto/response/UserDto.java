package com.jootalkpia.auth_server.user.dto.response;

public record UserDto(

        Long userId,

        String nickname,

        String profileImage
) {
    public static UserDto of(Long userId, String nickname, String profileImage) {
        return new UserDto(userId, nickname, profileImage);
    }
}
