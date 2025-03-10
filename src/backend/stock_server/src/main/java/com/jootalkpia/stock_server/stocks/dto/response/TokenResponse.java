package com.jootalkpia.stock_server.stocks.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TokenResponse(
        String accessToken,
        String accessTokenTokenExpired,
        String tokenType,
        String expiresIn
) {
}
