package com.jootalkpia.stock_server.support.property;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "feign.stock-token")
public record TokenProperties(
        String path,
        String grantType
) {
}
