package com.jootalkpia.auth_server.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.auth_server.jwt.JwtReactiveAuthenticationManager;
import com.jootalkpia.auth_server.jwt.JwtServerAuthenticationConverter;
import com.jootalkpia.auth_server.jwt.JwtTokenProvider;
import com.jootalkpia.auth_server.response.ApiResponseDto;
import com.jootalkpia.auth_server.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 변환용

    private static final String[] AUTH_WHITELIST = {
            "/api/v1/user/login",
            "/api/v1/user/token-refresh",
            "/api/v1/actuator/health",
            "/v3/**",
            "/swagger-ui/**"
    };

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customJwtAuthenticationEntryPoint())
                        .accessDeniedHandler(customAccessDeniedHandler())
                )

                .authorizeExchange(auth -> auth
                        .pathMatchers(AUTH_WHITELIST).permitAll()
                        .anyExchange().authenticated()
                )

                .addFilterAt(jwtAuthenticationFilter(), SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    private AuthenticationWebFilter jwtAuthenticationFilter() {
        ReactiveAuthenticationManager authManager = new JwtReactiveAuthenticationManager(jwtTokenProvider);
        AuthenticationWebFilter filter = new AuthenticationWebFilter(authManager);
        filter.setServerAuthenticationConverter(new JwtServerAuthenticationConverter());
        filter.setRequiresAuthenticationMatcher(ServerWebExchangeMatchers.anyExchange());
        return filter;
    }

    private ServerAuthenticationEntryPoint customJwtAuthenticationEntryPoint() {
        return (exchange, ex) -> {
            ErrorCode error = ErrorCode.EMPTY_PRINCIPAL;
            ApiResponseDto<?> errorResponse = ApiResponseDto.fail(error);

            exchange.getResponse().setStatusCode(error.getHttpStatus());
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            try {
                byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
                DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
                return exchange.getResponse().writeWith(Mono.just(buffer));
            } catch (JsonProcessingException e) {
                return Mono.error(e);
            }
        };
    }

    private ServerAccessDeniedHandler customAccessDeniedHandler() {
        return (exchange, ex) -> {
            ErrorCode error = ErrorCode.FORBIDDEN;
            ApiResponseDto<?> errorResponse = ApiResponseDto.fail(error);

            exchange.getResponse().setStatusCode(error.getHttpStatus());
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            try {
                byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
                DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
                return exchange.getResponse().writeWith(Mono.just(buffer));
            } catch (JsonProcessingException e) {
                return Mono.error(e);
            }
        };
    }
}
