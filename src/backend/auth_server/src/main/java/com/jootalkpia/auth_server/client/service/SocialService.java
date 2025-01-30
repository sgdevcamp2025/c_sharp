package com.jootalkpia.auth_server.client.service;


import com.jootalkpia.auth_server.client.dto.UserInfoResponse;
import com.jootalkpia.auth_server.client.dto.UserLoginRequest;

public interface SocialService {
    UserInfoResponse login(final String authorizationToken, final UserLoginRequest loginRequest);
}
