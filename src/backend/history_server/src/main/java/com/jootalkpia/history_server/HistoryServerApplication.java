package com.jootalkpia.history_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@EnableMongoAuditing
@SpringBootApplication(scanBasePackages = {
		"com.jootalkpia.history_server",
		"com.jootalkpia.passport",
		"com.jootalkpia.config",
})
public class HistoryServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(HistoryServerApplication.class, args);
	}

}
