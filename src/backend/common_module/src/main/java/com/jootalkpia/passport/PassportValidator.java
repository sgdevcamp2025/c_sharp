package com.jootalkpia.passport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jootalkpia.passport.component.Passport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
@RequiredArgsConstructor
public class PassportValidator {
    private final ObjectMapper objectMapper;
    private final HMACEncoder hmacEncoder;

    public boolean validatePassport(String encodedPassport) {
        try {
            String passportStr = new String(Base64.getDecoder().decode(encodedPassport));
            Passport passport = objectMapper.readValue(passportStr, Passport.class);
            String expectedKey = hmacEncoder.createHMACIntegrityKey(objectMapper.writeValueAsString(passport.userInfo()));
            return expectedKey.equals(passport.integrityKey());
        } catch (Exception e) {
            return false;
        }
    }
}
