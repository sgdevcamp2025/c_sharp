package com.jootalkpia.auth_server.client.kakao;

import com.jootalkpia.auth_server.client.dto.UserInfoResponse;
import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import com.jootalkpia.auth_server.client.kakao.response.KakaoUserResponse;
import com.jootalkpia.auth_server.client.service.SocialService;
import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.response.ErrorCode;
import com.jootalkpia.auth_server.user.domain.Platform;
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


    private final KakaoApiClient kakaoApiClient;
    private final KakaoAuthWebClientService kakaoAuthWebClientService;

    @Transactional
    @Override
    public Mono<UserInfoResponse> login(
            final String authorizationCode,
            final UserLoginRequest loginRequest
    ) {
        return kakaoAuthWebClientService.getAccessToken(authorizationCode, loginRequest.redirectUri())
                .flatMap(tokenResponse ->
                        kakaoApiClient.getUserInfo(tokenResponse.getAccessToken())
                )
                .map(userResponse -> getLoginDto(loginRequest.platform(), userResponse))
                .onErrorMap(Exception.class, e -> {
                    log.error("❌ Kakao 로그인 실패: {}", e.getMessage(), e);
                    return new CustomException(ErrorCode.AUTHENTICATION_CODE_EXPIRED);
                });
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