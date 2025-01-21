package com.jootalkpia.stock_server.stocks.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TokenRequestBody(
        @JsonProperty("grant_type") String grantType,
        @JsonProperty("appkey") String appKey,
        @JsonProperty("appsecret") String appSecret
) {
}
