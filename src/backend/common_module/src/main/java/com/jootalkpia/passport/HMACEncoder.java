package com.jootalkpia.passport;

import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;

public class HMACEncoder {

    private final String HMacAlgorithm;
    private final String passportSecretKey;

    public HMACEncoder(
            @Value("${passport.algorithm}") String HMacAlgorithm,
            @Value("${passport.key}") String passportSecretKey
    ) {
        this.HMacAlgorithm = HMacAlgorithm;
        this.passportSecretKey = passportSecretKey;
    }

    protected String createHMACIntegrityKey(String userInfoString) {
        SecretKeySpec secretKeySpec = new SecretKeySpec(
                passportSecretKey.getBytes(),
                HMacAlgorithm
        );
        Mac mac;
        try {
            mac = Mac.getInstance(HMacAlgorithm);
            mac.init(secretKeySpec);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return Base64.getEncoder()
                .encodeToString(mac.doFinal(userInfoString.getBytes()));
    }
}
