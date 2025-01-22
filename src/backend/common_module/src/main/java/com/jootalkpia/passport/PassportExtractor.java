package com.jootalkpia.passport;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.Passport;
import com.jootalkpia.passport.component.UserInfo;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import lombok.RequiredArgsConstructor;

//@Component 추후 gateway 진행하며 확인 필요
@RequiredArgsConstructor
public class PassportExtractor {

    private static final String USER_INFO = "userInfo";
    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";
    private final ObjectMapper objectMapper;
    private final PassportValidator passportValidator;

    public Passport getPassportFromRequestHeader(HttpServletRequest httpServletRequest) throws JsonProcessingException { //예외처리 수정 필요

        return objectMapper.readValue(
                new String(
                        Base64.getDecoder().decode(httpServletRequest.getHeader(AUTHORIZATION_HEADER_NAME)),
                        StandardCharsets.UTF_8
                ),
                Passport.class
        );

    }

    public UserInfo getUserInfoByPassport(Passport passport) throws JsonProcessingException { //예외처리 수정 필요

        String passportString = new String(
                Base64.getDecoder().decode(passport.toString())
        );

        passportValidator.validatePassport(passportString);

        String userInfoString = objectMapper.readTree(passportString)
                .get(USER_INFO)
                .toString();
        return objectMapper.readValue(
                userInfoString,
                UserInfo.class
        );

    }
}