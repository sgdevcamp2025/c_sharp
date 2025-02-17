package com.jootalkpia.gateway_server.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.gateway_server.filter.paths.ExcludedPaths;
import com.jootalkpia.passport.component.Passport;
import java.util.List;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class PassportAuthorizationFilter extends AbstractGatewayFilterFactory<PassportAuthorizationFilter.Config> {

    List<String> EXCLUDED_PATHS = ExcludedPaths.getAllPaths();

    private final ObjectMapper objectMapper;

    public PassportAuthorizationFilter(ObjectMapper objectMapper) {
        super(Config.class);
        this.objectMapper = objectMapper;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            if (EXCLUDED_PATHS.contains(path)) {
                log.info("PassportAuthorizationFilter 적용 제외: {}", path);
                return chain.filter(exchange);
            }

            Passport passport = exchange.getAttribute("passport");

            if (passport != null) {
                try {
                    String userInfoJson = objectMapper.writeValueAsString(passport.userInfo());
                    exchange.getRequest().mutate()
                            .header("X-Passport-User", userInfoJson);
                    log.info("[PassportRelayFilter] Added X-Passport-User Header: {}", userInfoJson);
                } catch (JsonProcessingException e) {
                    log.error("[PassportRelayFilter] Failed to convert UserInfo to JSON", e);
                    throw new RuntimeException(e);
                }
            } else {
                log.warn("[PassportRelayFilter] No Passport found, skipping relay.");
            }

            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        log.error("Authorization Error: {}", err);
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    @Data
    public static class Config {
        // 설정이 필요하면 여기에 추가
    }
}
