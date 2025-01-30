package com.jootalkpia.auth_server.user.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SocialType {
    KAKAO("KAKAO"),
    ;
    private final String type;
}
