package com.jootalkpia.stock_server.stocks.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jootalkpia.stock_server.support.property.BaseProperties;
import com.jootalkpia.stock_server.support.property.TokenProperties;

public record TokenRequestBody(
        @JsonProperty("grant_type") String grantType,
        @JsonProperty("appkey") String appKey,
        @JsonProperty("appsecret") String appSecret
) {

    public static TokenRequestBody from(BaseProperties baseProperties, TokenProperties tokenProperties) {
        return new TokenRequestBody(
                tokenProperties.grantType(),
                baseProperties.appKey(),
                baseProperties.appSecret()
        );
    }
}
