package com.jootalkpia.auth_server.jwt;

import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.redis.Token;
import com.jootalkpia.auth_server.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Service
public class TokenService {

    private final TokenRepository tokenRepository;

    public Mono<Void> saveRefreshToken(final Long userId, final String refreshToken) {
        return Mono.fromRunnable(() -> tokenRepository.save(Token.of(userId, refreshToken)));
    }

    public Mono<Long> findIdByRefreshToken(final String refreshToken) {
        return Mono.defer(() ->
                tokenRepository.findByRefreshToken(refreshToken)
                        .map(Token::getId)
                        .map(Mono::just)
                        .orElseGet(() -> Mono.error(new CustomException(ErrorCode.REFRESH_TOKEN_NOT_FOUND)))
        );
    }
}
