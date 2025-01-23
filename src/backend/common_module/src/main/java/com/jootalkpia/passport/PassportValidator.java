package com.jootalkpia.passport;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import lombok.RequiredArgsConstructor;

//@Component
@RequiredArgsConstructor
public class PassportValidator {

    private static final String USER_INFO = "userInfo";
    private static final String INTEGRITY_KEY = "integrityKey";
    private final ObjectMapper objectMapper;
    private final HMACEncoder hmacEncoder;

    public void validatePassport(String requestedPassport) {
        String encodedUserInfo;
        String integrityKey;

        try {
            String passportStr = new String(
                    Base64.getDecoder().decode(requestedPassport)
            );
            String userInfoString = objectMapper.readTree(passportStr)
                    .get(USER_INFO)
                    .toString();
            encodedUserInfo = hmacEncoder.createHMACIntegrityKey(userInfoString);
            integrityKey = objectMapper.readTree(passportStr)
                    .get(INTEGRITY_KEY)
                    .asText();

            isEqualByRequestedPassport(integrityKey, encodedUserInfo);
        } catch (Exception e) {
            //예외처리 추가하기
        }

    }

    private void isEqualByRequestedPassport(
            String integrityKey,
            String encodedUserInfo
    ) {
        if (!encodedUserInfo.equals(integrityKey)) {
            //예외처리 추가하기
        }
    }
}
