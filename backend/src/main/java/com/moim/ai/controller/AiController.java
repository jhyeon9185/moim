package com.moim.ai.controller;

import com.moim.ai.dto.MomiChatRequest;
import com.moim.ai.service.AiService;
import com.moim.ai.service.MomiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final MomiChatService momiChatService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> status() {
        return ResponseEntity.ok(Map.of("enabled", aiService.isAvailable()));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {
        String response = aiService.chat(body.get("message"));
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping("/momi")
    public ResponseEntity<Map<String, String>> momi(@RequestBody MomiChatRequest req) {
        String reply = momiChatService.chat(req);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
