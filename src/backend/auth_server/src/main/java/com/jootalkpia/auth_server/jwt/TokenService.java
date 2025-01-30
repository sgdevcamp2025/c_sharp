package com.jootalkpia.auth_server.jwt;

import com.jootalkpia.auth_server.redis.Token;
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
}
