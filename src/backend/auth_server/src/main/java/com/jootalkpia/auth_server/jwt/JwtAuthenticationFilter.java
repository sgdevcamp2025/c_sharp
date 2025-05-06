package com.jootalkpia.auth_server.jwt;

import com.jootalkpia.auth_server.response.ErrorCode;
import com.jootalkpia.auth_server.security.UserAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String token = extractToken(exchange);

        if (token != null) {
            switch (jwtTokenProvider.validateToken(token)) {
                case VALID_JWT -> {
                    Long userId = jwtTokenProvider.getUserFromJwt(token);
                    UserAuthentication authentication = new UserAuthentication(userId.toString(), null, null);
                    return chain.filter(exchange)
                            .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
                }
                case EXPIRED_JWT_TOKEN -> {
                    return handleException(exchange, ErrorCode.ACCESS_TOKEN_EXPIRED);
                }
                default -> {
                    return handleException(exchange, ErrorCode.EMPTY_PRINCIPAL);
                }
            }
        }
        return chain.filter(exchange);
    }

    private String extractToken(ServerWebExchange exchange) {
        String bearer = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    private Mono<Void> handleException(ServerWebExchange exchange, ErrorCode errorCode) {
        exchange.getResponse().setStatusCode(errorCode.getHttpStatus());
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("""
        {
            "code": "%s",
            "message": "%s"
        }
        """, errorCode.getCode(), errorCode.getMessage());

        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse()
                .writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(bytes)));
    }
}

