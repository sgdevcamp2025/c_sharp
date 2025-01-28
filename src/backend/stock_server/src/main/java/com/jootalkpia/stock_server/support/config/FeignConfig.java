package com.jootalkpia.stock_server.support.config;

import feign.Logger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class FeignConfig {
    @Bean
    public feign.Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}
