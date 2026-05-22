package com.smartfood.order_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class McpClientConfig {

    @Value("${mcp.ai-agent.base-url}")
    private String aiAgentBaseUrl;

    @Bean
    public WebClient mcpWebClient() {
        return WebClient.builder()
                .baseUrl(aiAgentBaseUrl)
                .build();
    }
}