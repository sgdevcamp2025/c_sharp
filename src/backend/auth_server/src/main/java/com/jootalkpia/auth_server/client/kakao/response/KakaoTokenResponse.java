package com.jootalkpia.auth_server.client.kakao.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KakaoTokenResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("expires_in")
    private Long expiresIn;

    @JsonProperty("token_type")
    private String tokenType;

    // 필요에 따라 추가적인 필드들:
    @JsonProperty("scope")
    private String scope;

    @JsonProperty("refresh_token_expires_in")
    private Long refreshTokenExpiresIn;

}
