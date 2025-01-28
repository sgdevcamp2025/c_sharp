package com.jootalkpia.auth_server.user.controller;

import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import com.jootalkpia.auth_server.user.dto.LoginSuccessResponse;
import com.jootalkpia.auth_server.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("api/v1/user/login")
    public ResponseEntity<LoginSuccessResponse> login(
            @RequestParam final String authorizationCode,
            @RequestBody final UserLoginRequest loginRequest
    ) {
        return ResponseEntity.ok().body(userService.create(authorizationCode, loginRequest));
    }

}
