package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GotenbergConfig {

    @Value("${gotenberg.url:http://localhost:3000}")
    private String gotenbergUrl;

    @Bean
    public WebClient gotenbergWebClient() {
        return WebClient.builder()
                .baseUrl(gotenbergUrl)
                .build();
    }
}
