package com.moim.ai.service;

import com.moim.config.OpenAiConfig;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiService {

    private final OpenAiConfig openAiConfig;
    private OpenAiService openAiService;

    public boolean isAvailable() {
        return openAiConfig.isEnabled();
    }

    public String chat(String message) {
        if (!isAvailable()) {
            throw new IllegalStateException("OpenAI API가 설정되지 않았습니다.");
        }

        if (openAiService == null) {
            openAiService = openAiConfig.openAiService();
        }

        ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(List.of(new ChatMessage("user", message)))
                .maxTokens(500)
                .build();

        return openAiService.createChatCompletion(request)
                .getChoices().get(0).getMessage().getContent();
    }
}
