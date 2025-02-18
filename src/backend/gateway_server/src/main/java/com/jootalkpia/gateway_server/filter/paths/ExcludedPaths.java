package com.jootalkpia.gateway_server.filter.paths;

import java.util.Arrays;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ExcludedPaths {
    LOGIN("/api/v1/user/login"),
    TOKEN_REFRESH("/api/v1/user/token-refresh"),
    ACTUATOR_HEALTH("/api/v1/actuator/health"),
    SWAGGER_V3("/v3/"),
    SWAGGER_UI("/swagger-ui/");

    private final String path;

    public static List<String> getAllPaths() {
        return Arrays.stream(ExcludedPaths.values())
                .map(ExcludedPaths::getPath)
                .toList();
    }
}

