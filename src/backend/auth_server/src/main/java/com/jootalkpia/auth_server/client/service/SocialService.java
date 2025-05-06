package com.jootalkpia.auth_server.client.service;

import com.jootalkpia.auth_server.client.dto.UserInfoResponse;
import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import reactor.core.publisher.Mono;

public interface SocialService {
    Mono<UserInfoResponse> login(final String authorizationToken, final UserLoginRequest loginRequest);
}
