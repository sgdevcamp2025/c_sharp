package com.jootalkpia.gateway_server.filter;

import com.jootalkpia.gateway_server.filter.paths.ExcludedPaths;
import com.jootalkpia.passport.component.Passport;
import java.util.List;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final List<String> EXCLUDED_PATHS = ExcludedPaths.getAllPaths();
    private final WebClient authServerClient;

    public JwtAuthenticationFilter(WebClient.Builder webClientBuilder,
                                   @Value("${auth_server.path}") String authServerPath) {
        super(Config.class);
        log.info("Auth Server Path: {}", authServerPath);
        this.authServerClient = webClientBuilder.baseUrl(authServerPath).build();
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            if (EXCLUDED_PATHS.contains(path)) {
                System.out.println("⏩ JwtAuthenticationFilter 적용 제외: " + path);
                return chain.filter(exchange);
            }

            ServerHttpRequest request = exchange.getRequest();
            HttpHeaders headers = request.getHeaders();

            // Authorization 헤더가 없으면 에러 반환
            if (!headers.containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            // JWT 토큰 추출
            String token = headers.getFirst(HttpHeaders.AUTHORIZATION).replace("Bearer ", "");

            log.info("Validating JWT Token...");

            return authServerClient.post()
                    .uri("/auth/validate")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(Passport.class)
                    .flatMap(passport -> {
                        log.info("JWT Token is valid. Attaching passport to exchange.");
                        exchange.getAttributes().put("passport", passport);
                        return chain.filter(exchange);
                    })
                    .onErrorResume(e -> {
                        log.error("JWT Validation Failed: {}", e.getMessage());
                        return onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
                    });
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        log.error("Authentication Error: {}", err);
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    @Data
    public static class Config {
        // 설정값이 필요하면 여기에 추가
    }
}
