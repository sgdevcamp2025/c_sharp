package com.jootalkpia.signaling_server.config;

import org.kurento.client.KurentoClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class KurentoClientConfig {

    @Value("${kurento.ws.url}")
    private String kurentoWsUrl;

    @Bean
    public KurentoClient kurentoClient() {
        log.info("Initializing KurentoClient with URL: {}", kurentoWsUrl);
        return KurentoClient.create(kurentoWsUrl);
    }
}
