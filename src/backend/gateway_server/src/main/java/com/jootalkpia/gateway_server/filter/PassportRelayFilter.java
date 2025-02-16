package com.jootalkpia.gateway_server.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.Passport;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PassportRelayFilter extends AbstractGatewayFilterFactory<PassportRelayFilter.Config> {

    public PassportRelayFilter(ObjectMapper objectMapper) {
        super(Config.class); // ✅ super(Config.class) 추가
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            Passport passport = exchange.getAttribute("passport");

            if (passport != null) {
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    String userInfoJson = objectMapper.writeValueAsString(passport.userInfo());

                    log.info("✅ [PassportRelayFilter] Adding X-Passport-User Header: {}", userInfoJson);

                    ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                            .header("X-Passport-User", userInfoJson)
                            .build();

                    return chain.filter(exchange.mutate().request(modifiedRequest).build());
                } catch (JsonProcessingException e) {
                    log.error("❌ [PassportRelayFilter] Failed to serialize UserInfo", e);
                    return exchange.getResponse().setComplete();
                }
            }

            log.warn("⚠️ [PassportRelayFilter] No Passport found, skipping relay.");
            return chain.filter(exchange);
        };
    }


    @Data
    public static class Config {
        // ✅ 반드시 static으로 선언
        // 필요한 설정이 있으면 추가 가능
    }
}
