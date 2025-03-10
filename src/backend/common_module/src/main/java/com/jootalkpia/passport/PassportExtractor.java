package com.jootalkpia.passport;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.Passport;
import com.jootalkpia.passport.component.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@RequiredArgsConstructor
public class PassportExtractor {

    private static final String USER_INFO = "userInfo";
    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";
    private final ObjectMapper objectMapper;
    private final PassportValidator passportValidator;

    public Mono<Passport> getPassportFromRequestHeader(ServerWebExchange exchange) {
        return Mono.justOrEmpty(exchange.getRequest()
                        .getHeaders()
                        .getFirst(AUTHORIZATION_HEADER_NAME))
                .map(header -> new String(Base64.getDecoder().decode(header), StandardCharsets.UTF_8))
                .flatMap(passportStr -> {
                    try {
                        Passport passport = objectMapper.readValue(passportStr, Passport.class);
                        return Mono.just(passport);
                    } catch (JsonProcessingException e) {
                        return Mono.error(new RuntimeException("Invalid Passport Format", e));
                    }
                });
    }

    public Mono<UserInfo> getUserInfoByPassport(Passport passport) {
        return Mono.fromCallable(() -> {
            String passportString = new String(Base64.getDecoder().decode(passport.toString()));
            passportValidator.validatePassport(passportString);
            String userInfoString = objectMapper.readTree(passportString).get(USER_INFO).toString();
            return objectMapper.readValue(userInfoString, UserInfo.class);
        });
    }
}
