package com.jootalkpia.passport.anotation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.UserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Slf4j
@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final ObjectMapper objectMapper; // JSON 파싱을 위한 ObjectMapper 추가

    public CurrentUserArgumentResolver(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null &&
                parameter.getParameterType().equals(UserInfo.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        String userJson = webRequest.getHeader("X-Passport-User");

        if (userJson == null) {
            throw new RuntimeException("Missing X-Passport-User header");
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            UserInfo userInfo = objectMapper.readValue(userJson, UserInfo.class);
            return userInfo;
        } catch (Exception e) {
            throw new RuntimeException("Invalid X-Passport-User header format", e);
        }
    }


}
