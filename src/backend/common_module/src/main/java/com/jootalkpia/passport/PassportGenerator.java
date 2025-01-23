package com.jootalkpia.passport;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.Passport;
import com.jootalkpia.passport.component.UserInfo;
import java.util.Base64;
import lombok.RequiredArgsConstructor;

//@Component 추후 gateway 진행하며 확인 필요
@RequiredArgsConstructor
public class PassportGenerator {

    private final HMACEncoder hmacEncoder;
    private final ObjectMapper objectMapper;

    public String generatePassport(UserInfo userInfo) {
        String encodedPassportString ="";

        try {
            String userInfoString = objectMapper.writeValueAsString(userInfo);
            String integrityKey = hmacEncoder.createHMACIntegrityKey(userInfoString);

            Passport passport = new Passport(userInfo, integrityKey);
            String passportString = objectMapper.writeValueAsString(passport);
            encodedPassportString = Base64.getEncoder()
                    .encodeToString(passportString.getBytes());
        } catch (JsonProcessingException e) {
            //예외 처리 추가하기
        }
        return encodedPassportString;
    }
}

