package com.moim.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import com.theokanning.openai.service.OpenAiService;

@Configuration
public class OpenAiConfig {

    @Value("${openai.api-key:}")
    private String apiKey;

    @Bean
    @Lazy // API Key 없으면 생성하지 않음
    public OpenAiService openAiService() {
        if (apiKey == null || apiKey.isEmpty()) {
            return null;
        }
        return new OpenAiService(apiKey);
    }

    public boolean isEnabled() {
        return apiKey != null && !apiKey.isEmpty();
    }
}
