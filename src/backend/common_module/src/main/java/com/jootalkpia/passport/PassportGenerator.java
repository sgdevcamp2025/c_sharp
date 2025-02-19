package com.jootalkpia.passport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.Passport;
import com.jootalkpia.passport.component.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PassportGenerator {
    private final ObjectMapper objectMapper;
    private final HMACEncoder hmacEncoder;

    public Passport generatePassport(Long userId) {
        try {
            UserInfo userInfo = new UserInfo(userId);
            String userInfoString = objectMapper.writeValueAsString(userInfo);
            String integrityKey = hmacEncoder.createHMACIntegrityKey(userInfoString);
            Passport passport = new Passport(userInfo, integrityKey);
            return passport;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate passport", e);
        }
    }
}

