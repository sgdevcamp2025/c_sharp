package com.example.stock_server.support.property;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "feign.minute-price")
public record MinutePriceProperties(
        String path,
        String trId,
        String custtype,
        String etcClsCode,
        String marketDivCode,
        String pwDataIncuYn
) {
}
