package com.jootalkpia.auth_server.user.controller;

import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import com.jootalkpia.auth_server.user.dto.request.UpdateNicknameRequest;
import com.jootalkpia.auth_server.user.dto.response.GetAccessTokenResponse;
import com.jootalkpia.auth_server.user.dto.response.LoginResponse;
import com.jootalkpia.auth_server.user.dto.response.UpdateNicknameResponse;
import com.jootalkpia.auth_server.user.service.UserService;
import com.jootalkpia.passport.anotation.CurrentUser;
import com.jootalkpia.passport.component.UserInfo;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class UserController implements UserControllerDocs {

    private final UserService userService;

    @GetMapping("/api/v1/user/me")
    public ResponseEntity<UserInfo> getUserInfo(@CurrentUser UserInfo userInfo) {
        log.info("📢 [Controller] Received UserInfo: {}", userInfo);

        if (userInfo == null) {
            log.error("[Controller] UserInfo is NULL!");
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().body(userInfo);
    }

    @Override
    @PostMapping("api/v1/user/login")
    public ResponseEntity<LoginResponse> login(
            @RequestParam final String authorizationCode,
            @RequestBody final UserLoginRequest loginRequest
    ) {
        return ResponseEntity.ok().body(userService.create(authorizationCode, loginRequest));
    }

    @Override
    @GetMapping("api/v1/user/token-refresh")
    public ResponseEntity<GetAccessTokenResponse> refreshToken(
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
