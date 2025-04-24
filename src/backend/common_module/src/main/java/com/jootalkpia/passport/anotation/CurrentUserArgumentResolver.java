package com.jootalkpia.passport.anotation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.UserInfo;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.BindingContext;
import org.springframework.web.reactive.result.method.HandlerMethodArgumentResolver;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final ObjectMapper objectMapper;

    public CurrentUserArgumentResolver(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(UserInfo.class);
    }

    @Override
    public Mono<Object> resolveArgument(MethodParameter parameter,
                                        BindingContext bindingContext,
                                        ServerWebExchange exchange) {

        String userJson = exchange.getRequest().getHeaders().getFirst("X-Passport-User");

        if (userJson == null) {
            return Mono.empty();
        }

        try {
            UserInfo userInfo = objectMapper.readValue(userJson, UserInfo.class);
            return Mono.just(userInfo);
        } catch (Exception e) {
            return Mono.error(new RuntimeException("Invalid X-Passport-User header", e));
        }
    }
}
