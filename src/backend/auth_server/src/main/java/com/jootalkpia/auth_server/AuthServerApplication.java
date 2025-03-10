package com.jootalkpia.auth_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@EnableFeignClients
@ImportAutoConfiguration(FeignAutoConfiguration.class)
@SpringBootApplication(scanBasePackages = {
        "com.jootalkpia.auth_server",
        "com.jootalkpia.passport",
        "com.jootalkpia.config",
})
public class AuthServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServerApplication.class, args);
    }

}
