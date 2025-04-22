package com.jootalkpia.auth_server.client.kakao;

import com.jootalkpia.auth_server.client.dto.UserInfoResponse;
import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import com.jootalkpia.auth_server.client.kakao.response.KakaoAccessTokenResponse;
import com.jootalkpia.auth_server.client.kakao.response.KakaoUserResponse;
import com.jootalkpia.auth_server.client.service.SocialService;
import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.response.ErrorCode;
import com.jootalkpia.auth_server.user.domain.Platform;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class KakaoSocialService implements SocialService {

    private static final String AUTH_CODE = "authorization_code";

    @Value("${kakao.clientId}")
    private String clientId;
    private final KakaoApiClient kakaoApiClient;
    private final KakaoAuthApiClient kakaoAuthApiClient;

    @Transactional
    @Override
    public Mono<UserInfoResponse> login(
            final String authorizationCode,
            final UserLoginRequest loginRequest
    ) {
        return getOAuth2Authentication(authorizationCode, loginRequest.redirectUri())
                .flatMap(accessToken ->
                        getUserInfo(accessToken)
                                .map(userResponse -> getLoginDto(loginRequest.platform(), userResponse))
                )
                .onErrorMap(FeignException.class, e -> {
                    log.error("Authentication code expired: {}", e.getMessage());
                    return new CustomException(ErrorCode.AUTHENTICATION_CODE_EXPIRED);
                });
    }


    private Mono<String> getOAuth2Authentication(
            final String authorizationCode,
            final String redirectUri
    ) {
        return Mono.fromCallable(() ->
                kakaoAuthApiClient.getOAuth2AccessToken(
                        AUTH_CODE,
                        clientId,
                        redirectUri,
                        authorizationCode
                ).accessToken()
        );
    }

    private Mono<KakaoUserResponse> getUserInfo(
            final String accessToken
    ) {
        return Mono.fromCallable(() ->
                kakaoApiClient.getUserInformation("Bearer " + accessToken)
        );
    }

    private UserInfoResponse getLoginDto(
            final Platform platform,
            final KakaoUserResponse userResponse
    ) {
        return UserInfoResponse.of(
                userResponse.id(),
                platform,
                userResponse.kakaoAccount().email(),
                userResponse.kakaoAccount().profile().nickname()
        );
    }
}
