package com.jootalkpia.passport.component;

public record UserInfo(
        Long userId,
        String nickname,
        Boolean isActivated,
        String accessedAt,
        String createdAt,
        String deletedAt
) {
}
