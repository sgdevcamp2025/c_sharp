package com.jootalkpia.state_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan
@SpringBootApplication
public class StateServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(StateServerApplication.class, args);
    }

}
