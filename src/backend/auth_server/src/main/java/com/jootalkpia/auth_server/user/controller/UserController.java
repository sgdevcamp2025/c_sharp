package com.jootalkpia.auth_server.user.controller;

import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import com.jootalkpia.auth_server.user.dto.request.UpdateNicknameRequest;
import com.jootalkpia.auth_server.user.dto.response.AccessTokenGetSuccess;
import com.jootalkpia.auth_server.user.dto.response.LoginSuccessResponse;
import com.jootalkpia.auth_server.user.dto.response.UpdateNicknameResponse;
import com.jootalkpia.auth_server.user.service.UserService;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
//import com.jootalkpia.aop.JootalkpiaAuthenticationContext;

@RestController
@RequiredArgsConstructor
public class UserController implements UserControllerDocs {

    private final UserService userService;

    @Override
    @PostMapping("api/v1/user/login")
    public ResponseEntity<LoginSuccessResponse> login(
            @RequestParam final String authorizationCode,
            @RequestBody final UserLoginRequest loginRequest
    ) {
        return ResponseEntity.ok().body(userService.create(authorizationCode, loginRequest));
    }

    @Override
    @GetMapping("api/v1/user/token-refresh")
    public ResponseEntity<AccessTokenGetSuccess> refreshToken(
            @RequestParam final String token
    ) {
        return ResponseEntity.ok().body(userService.refreshToken(token));
    }

    @Override
    @PatchMapping("api/v1/user/profile")
    public ResponseEntity<UpdateNicknameResponse> updateNickname (
            @RequestBody final UpdateNicknameRequest request,
            Principal principal
    ) {
        Long userId = Long.valueOf(principal.getName());//JootalkpiaAuthenticationContext.getUserInfo().userId();
        return ResponseEntity.ok().body(userService.updateNickname(request.nickname(), userId));
    }
}
