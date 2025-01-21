package com.jootalkpia.stock_server.support.property;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "feign")
public record BaseProperties(
        String baseUrl,
        String appKey,
        String appSecret
) {
}
