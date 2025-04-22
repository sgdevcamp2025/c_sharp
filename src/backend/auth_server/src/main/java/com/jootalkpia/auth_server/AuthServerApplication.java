package com.jootalkpia.auth_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignAutoConfiguration;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@EnableR2dbcAuditing
@EnableFeignClients
@ImportAutoConfiguration(FeignAutoConfiguration.class)
@EnableR2dbcRepositories(basePackages = "com.jootalkpia.auth_server.user.repository")
@EnableRedisRepositories(basePackages = "com.jootalkpia.auth_server.jwt")
@SpringBootApplication(
        scanBasePackages = {
                "com.jootalkpia.auth_server",
                "com.jootalkpia.passport",
                "com.jootalkpia.config",
        },
        exclude = {
                SecurityAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class
        }
)
public class AuthServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServerApplication.class, args);
    }

}
