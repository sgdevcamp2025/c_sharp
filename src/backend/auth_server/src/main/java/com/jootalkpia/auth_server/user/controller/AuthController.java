package com.jootalkpia.auth_server.user.controller;

import com.jootalkpia.auth_server.jwt.JwtTokenProvider;
import com.jootalkpia.passport.PassportGenerator;
import com.jootalkpia.passport.component.Passport;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final PassportGenerator passportGenerator;


    @PostMapping("/auth/validate")
    public Passport validateJwt(@RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserFromJwt(token.replace("Bearer ", ""));
        return passportGenerator.generatePassport(userId);
    }
}
