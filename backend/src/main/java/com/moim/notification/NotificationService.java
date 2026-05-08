package com.moim.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SseEmitterStore emitterStore;

    public void send(Long userId, String title, String body) {
        emitterStore.get(userId).ifPresent(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(Map.of("title", title, "body", body)));
            } catch (IOException | IllegalStateException e) {
                emitterStore.remove(userId);
                try { emitter.complete(); } catch (Exception ignored) {}
            }
        });
    }

    public void sendToAll(String title, String body) {
        emitterStore.getAll().forEach((userId, emitter) -> send(userId, title, body));
    }
}
