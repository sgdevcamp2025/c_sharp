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
import com.jootalkpia.auth_server.user.domain.User;
import com.jootalkpia.auth_server.user.dto.response.GetAccessTokenResponse;
import com.jootalkpia.auth_server.user.dto.response.LoginResponse;
import com.jootalkpia.auth_server.user.dto.response.TokenDto;
import com.jootalkpia.auth_server.user.dto.response.UpdateNicknameResponse;
import com.jootalkpia.auth_server.user.dto.response.UserDto;
import com.jootalkpia.auth_server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final KakaoSocialService kakaoSocialService;

    @Value("${default_image}")
    private String defaultImage;

    public Mono<LoginResponse> create(String authorizationCode, UserLoginRequest loginRequest) {
        return getUserInfoResponse(authorizationCode, loginRequest) // 이미 Mono 반환
                .flatMap(this::getOrCreateUser)
                .flatMap(user -> getTokenDto(user)
                        .map(tokenDto -> {
                            UserDto userDto = UserDto.of(user.getUserId(), user.getNickname(), user.getProfileImage());
                            return LoginResponse.of(userDto, tokenDto);
                        }));
    }

    private Mono<User> getOrCreateUser(UserInfoResponse userInfo) {
        return userRepository.findBySocialIdAndPlatform(userInfo.socialId(), userInfo.platform())
                .switchIfEmpty(createUser(userInfo));
    }

    private Mono<User> createUser(UserInfoResponse userInfo) {
        User newUser = User.of(
                userInfo.socialId(),
                userInfo.email(),
                userInfo.platform(),
                userInfo.socialNickname() + "#" + userInfo.socialId(),
                defaultImage
        );
        return userRepository.save(newUser);
    }

    public Mono<GetAccessTokenResponse> refreshToken(String refreshToken) {
        if (jwtTokenProvider.validateToken(refreshToken) == EXPIRED_JWT_TOKEN) {
            return Mono.error(new CustomException(ErrorCode.REFRESH_TOKEN_EXPIRED));
        }

        Long userId = jwtTokenProvider.getUserFromJwt(refreshToken);
        if (!userId.equals(tokenService.findIdByRefreshToken(refreshToken))) {
            return Mono.error(new CustomException(ErrorCode.TOKEN_INCORRECT_ERROR));
        }

        UserAuthentication auth = new UserAuthentication(userId.toString(), null, null);
        return userRepository.findByUserId(userId)
                .switchIfEmpty(Mono.error(new CustomException(ErrorCode.USER_NOT_FOUND)))
                .map(user -> GetAccessTokenResponse.of(jwtTokenProvider.issueAccessToken(auth)));
    }

    public Mono<UpdateNicknameResponse> updateNickname(String nickname, Long userId) {
        return userRepository.findByUserId(userId)
                .switchIfEmpty(Mono.error(new CustomException(ErrorCode.USER_NOT_FOUND)))
                .flatMap(user -> userRepository.existsByNickname(nickname)
                        .flatMap(exists -> {
                            if (Boolean.TRUE.equals(exists)) {
                                return Mono.error(new CustomException(ErrorCode.DUPLICATION_NICKNAME));
                            }
                            user.updateNickname(nickname);
                            return userRepository.save(user)
                                    .map(updated -> UpdateNicknameResponse.of(
                                            updated.getUserId(),
                                            updated.getNickname(),
                                            updated.getProfileImage()
                                    ));
                        }));
    }

    public Mono<TokenDto> getTokenByUserId(Long userId) {
        return userRepository.findByUserId(userId)
                .switchIfEmpty(Mono.error(new CustomException(ErrorCode.USER_NOT_FOUND)))
                .flatMap(user -> {
                    UserAuthentication auth = new UserAuthentication(userId.toString(), null, null);
                    String refreshToken = jwtTokenProvider.issueRefreshToken(auth);
                    tokenService.saveRefreshToken(userId, refreshToken);

                    return Mono.just(TokenDto.of(
                            jwtTokenProvider.issueAccessToken(auth),
                            refreshToken
                    ));
                });
    }

    private Mono<TokenDto> getTokenDto(User user) {
        return getTokenByUserId(user.getUserId());
    }

    public Mono<UserInfoResponse> getUserInfoResponse(String authorizationCode, UserLoginRequest loginRequest) {
        return switch (loginRequest.platform()) {
            case KAKAO -> kakaoSocialService.login(authorizationCode, loginRequest);
            default -> Mono.error(new CustomException(ErrorCode.PLATFORM_BAD_REQUEST));
        };
    }

}
