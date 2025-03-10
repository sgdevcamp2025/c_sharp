package com.jootalkpia.workspace_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan
@SpringBootApplication(scanBasePackages = {
        "com.jootalkpia.workspace_server",
        "com.jootalkpia.passport",
        "com.jootalkpia.config",
})
public class WorkspaceServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkspaceServerApplication.class, args);
    }

}
