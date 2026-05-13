package com.moim.ai.controller;

import com.moim.ai.AiRateLimiter;
import com.moim.ai.dto.MomiChatRequest;
import com.moim.ai.service.AiService;
import com.moim.ai.service.MomiChatService;
import com.moim.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final MomiChatService momiChatService;
    private final AiRateLimiter rateLimiter;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "enabled", aiService.isAvailable(),
                "remaining", user != null ? rateLimiter.remaining(user.getId()) : 0,
                "limit", rateLimiter.getLimit()
        ));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body,
                                                    @AuthenticationPrincipal User user) {
        if (!rateLimiter.allow(user.getId())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "daily_limit_exceeded"));
        }
        String response = aiService.chat(body.get("message"));
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping("/momi")
    public ResponseEntity<Map<String, String>> momi(@RequestBody MomiChatRequest req,
                                                    @AuthenticationPrincipal User user) {
        if (!rateLimiter.allow(user.getId())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "daily_limit_exceeded"));
        }
        String reply = momiChatService.chat(req);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
