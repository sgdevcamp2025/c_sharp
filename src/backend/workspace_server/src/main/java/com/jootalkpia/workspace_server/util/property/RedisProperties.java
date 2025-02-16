package com.jootalkpia.workspace_server.util.property;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "spring.data.redis")
public record RedisProperties(
        String host,
        int port
) {
}
