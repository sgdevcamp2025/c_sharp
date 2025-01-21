package com.jootalkpia.stock_server.stocks.dto.response;

public record TokenResponse(
        String accessToken,
        String accessTokenTokenExpired,
        String tokenType,
        String expiresIn
) {
}
