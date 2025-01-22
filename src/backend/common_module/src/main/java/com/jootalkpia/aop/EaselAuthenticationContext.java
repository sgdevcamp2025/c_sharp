package com.jootalkpia.aop;

import com.jootalkpia.passport.component.Passport;
import com.jootalkpia.passport.component.UserInfo;

public class EaselAuthenticationContext {
    static final ThreadLocal<Passport> CONTEXT = new ThreadLocal<>();

    public static UserInfo getUserInfo() {
        return CONTEXT.get().userInfo();
    }

    public static String getIntegrityKey() {
        return CONTEXT.get().integrityKey();
    }
}
