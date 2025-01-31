package com.jootalkpia.auth_server.user.service;

import static com.jootalkpia.auth_server.jwt.JwtValidationType.EXPIRED_JWT_TOKEN;

import com.jootalkpia.auth_server.client.dto.UserInfoResponse;
import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import com.jootalkpia.auth_server.client.kakao.KakaoSocialService;
import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.jwt.JwtTokenProvider;
import com.jootalkpia.auth_server.jwt.TokenService;
import com.jootalkpia.auth_server.response.ErrorCode;
import com.jootalkpia.auth_server.security.UserAuthentication;
import com.jootalkpia.auth_server.user.domain.SocialType;
import com.jootalkpia.auth_server.user.domain.User;
import com.jootalkpia.auth_server.user.dto.AccessTokenGetSuccess;
import com.jootalkpia.auth_server.user.dto.LoginSuccessResponse;
import com.jootalkpia.auth_server.user.dto.TokenDto;
import com.jootalkpia.auth_server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final KakaoSocialService kakaoSocialService;

    public LoginSuccessResponse create(
            final String authorizationCode,
            final UserLoginRequest loginRequest
    ) {
        User user = getUser(getUserInfoResponse(authorizationCode, loginRequest));

        TokenDto tokenDto = getTokenDto(user);

        return LoginSuccessResponse.of(user.getNickname(), user.getId(), tokenDto);
    }

    public UserInfoResponse getUserInfoResponse(
            final String authorizationCode,
            final UserLoginRequest loginRequest
    ) {
        switch (loginRequest.socialType()) {
            case KAKAO:
                return kakaoSocialService.login(authorizationCode, loginRequest);
            default:
                throw new CustomException(ErrorCode.SOCIAL_TYPE_BAD_REQUEST);
        }
    }

    public User createUser(final UserInfoResponse userResponse) {
        User user = User.of(
                userResponse.socialId(),
                userResponse.email(),
                userResponse.socialType(),
                userResponse.socialNickname()+"#"+userResponse.socialId()
        );
        return userRepository.save(user);
    }

    public User getBySocialId(
            final Long socialId,
            final SocialType socialType
    ) {
        User user = userRepository.findUserBySocialTypeAndSocialId(socialId, socialType).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );
        return user;
    }

    public TokenDto getTokenByUserId(
            final Long id
    ) {
        // 사용자 정보 가져오기
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        UserAuthentication userAuthentication = new UserAuthentication(id.toString(), null);

        String refreshToken = jwtTokenProvider.issueRefreshToken(userAuthentication);
        tokenService.saveRefreshToken(id, refreshToken);
        return TokenDto.of(
                jwtTokenProvider.issueAccessToken(userAuthentication),
                refreshToken
        );
    }

    public AccessTokenGetSuccess refreshToken(
            final String refreshToken
    ) {
        if (jwtTokenProvider.validateToken(refreshToken) == EXPIRED_JWT_TOKEN) {
            // 리프레시 토큰이 만료된 경우
            throw new CustomException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        Long userId = jwtTokenProvider.getUserFromJwt(refreshToken);
        if (!userId.equals(tokenService.findIdByRefreshToken(refreshToken))) {
            throw new CustomException(ErrorCode.TOKEN_INCORRECT_ERROR);
        }

        // 사용자 정보 가져오기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        UserAuthentication userAuthentication = new UserAuthentication(userId.toString(), null);

        return AccessTokenGetSuccess.of(
                jwtTokenProvider.issueAccessToken(userAuthentication)
        );
    }

    private TokenDto getTokenDto(
            final User user
    ) {
        return getTokenByUserId(user.getId());
    }

    private User getUser(final UserInfoResponse userResponse) {
        if (isExistingUser(userResponse.socialId(), userResponse.socialType())) {
            return getBySocialId(userResponse.socialId(), userResponse.socialType());
        } else {
            return createUser(userResponse);
        }
    }

    private boolean isExistingUser(
            final Long socialId,
            final SocialType socialType
    ) {
        return userRepository.findUserBySocialTypeAndSocialId(socialId, socialType).isPresent();
    }
}

