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
import com.jootalkpia.auth_server.user.domain.Platform;
import com.jootalkpia.auth_server.user.domain.User;
import com.jootalkpia.auth_server.user.dto.response.GetAccessTokenResponse;
import com.jootalkpia.auth_server.user.dto.response.LoginResponse;
import com.jootalkpia.auth_server.user.dto.response.TokenDto;
import com.jootalkpia.auth_server.user.dto.response.UpdateNicknameResponse;
import com.jootalkpia.auth_server.user.dto.response.UserDto;
import com.jootalkpia.auth_server.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final KakaoSocialService kakaoSocialService;

    @Value("${default_image}")
    private String defaultImage;

    public LoginResponse create(
            final String authorizationCode,
            final UserLoginRequest loginRequest
    ) {
        User user = getUser(getUserInfoResponse(authorizationCode, loginRequest));
        UserDto userDto = UserDto.of(user.getUserId(), user.getNickname(),user.getProfileImage());
        TokenDto tokenDto = getTokenDto(user);

        return LoginResponse.of(userDto, tokenDto);
    }

    public UserInfoResponse getUserInfoResponse(
            final String authorizationCode,
            final UserLoginRequest loginRequest
    ) {
        switch (loginRequest.platform()) {
            case KAKAO:
                return kakaoSocialService.login(authorizationCode, loginRequest);
            default:
                throw new CustomException(ErrorCode.PLATFORM_BAD_REQUEST);
        }
    }

    public User createUser(final UserInfoResponse userResponse) {
        User user = User.of(
                userResponse.socialId(),
                userResponse.email(),
                userResponse.platform(),
                userResponse.socialNickname()+"#"+userResponse.socialId(),
                defaultImage
        );
        return userRepository.save(user);
    }

    public User getBySocialId(
            final Long socialId,
            final Platform platform
    ) {
        User user = userRepository.findUserByPlatformAndSocialId(socialId, platform).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );
        return user;
    }

    public TokenDto getTokenByUserId(
            final Long id
    ) {
        // 사용자 정보 가져오기
        userRepository.findByUserIdOrThrow(id);

        UserAuthentication userAuthentication = new UserAuthentication(id.toString(), null, null);

        String refreshToken = jwtTokenProvider.issueRefreshToken(userAuthentication);
        tokenService.saveRefreshToken(id, refreshToken);
        return TokenDto.of(
                jwtTokenProvider.issueAccessToken(userAuthentication),
                refreshToken
        );
    }

    public GetAccessTokenResponse refreshToken(
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
        userRepository.findByUserIdOrThrow(userId);

        UserAuthentication userAuthentication = new UserAuthentication(userId.toString(),null, null);

        return GetAccessTokenResponse.of(
                jwtTokenProvider.issueAccessToken(userAuthentication)
        );
    }

    @Transactional
    public UpdateNicknameResponse updateNickname(
            String nickname,
            Long userId
    ) {
        User user = userRepository.findByUserIdOrThrow(userId);

        if (userRepository.existsByNickname(nickname)) {
            throw new CustomException(ErrorCode.DUPLICATION_NICKNAME);
        }

        user.updateNickname(nickname);

        return UpdateNicknameResponse.of(user.getUserId(),user.getNickname(),user.getProfileImage());
    }

    private TokenDto getTokenDto(
            final User user
    ) {
        return getTokenByUserId(user.getUserId());
    }

    private User getUser(final UserInfoResponse userResponse) {
        if (isExistingUser(userResponse.socialId(), userResponse.platform())) {
            return getBySocialId(userResponse.socialId(), userResponse.platform());
        } else {
            return createUser(userResponse);
        }
    }

    private boolean isExistingUser(
            final Long socialId,
            final Platform platform
    ) {
        return userRepository.findUserByPlatformAndSocialId(socialId, platform).isPresent();
    }
}