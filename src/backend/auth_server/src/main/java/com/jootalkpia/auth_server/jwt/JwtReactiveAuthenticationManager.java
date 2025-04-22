package com.jootalkpia.auth_server.jwt;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import reactor.core.publisher.Mono;

import java.util.Collections;

@RequiredArgsConstructor
public class JwtReactiveAuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getCredentials().toString();

        if (jwtTokenProvider.validateToken(token) == JwtValidationType.VALID_JWT) {
            Long userId = jwtTokenProvider.getUserFromJwt(token);
            return Mono.just(new UsernamePasswordAuthenticationToken(userId.toString(), null, Collections.emptyList()));
        }

        return Mono.empty(); // 인증 실패
    }
}
