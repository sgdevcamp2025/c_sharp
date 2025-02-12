package com.jootalkpia.auth_server.jwt;

import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.redis.Token;
import com.jootalkpia.auth_server.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class TokenService {

    private final TokenRepository tokenRepository;

    @Transactional
    public void saveRefreshToken(final Long userId, final String refreshToken) {
        tokenRepository.save(
                Token.of(userId, refreshToken)
        );
    }

    public Long findIdByRefreshToken(final String refreshToken) {
        Token token = tokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(
                        () -> new CustomException(ErrorCode.REFRESH_TOKEN_NOT_FOUND)
                );
        return token.getId();
    }
}