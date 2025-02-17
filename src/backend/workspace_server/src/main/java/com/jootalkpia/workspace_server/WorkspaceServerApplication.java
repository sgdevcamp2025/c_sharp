package com.jootalkpia.workspace_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan
@SpringBootApplication
public class WorkspaceServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkspaceServerApplication.class, args);
    }

}
