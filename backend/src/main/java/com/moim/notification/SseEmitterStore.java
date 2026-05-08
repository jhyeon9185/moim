package com.moim.notification;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitterStore {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public void add(Long userId, SseEmitter emitter) {
        emitters.put(userId, emitter);
    }

    public void remove(Long userId) {
        emitters.remove(userId);
    }

    public Optional<SseEmitter> get(Long userId) {
        return Optional.ofNullable(emitters.get(userId));
    }

    public Map<Long, SseEmitter> getAll() {
        return Collections.unmodifiableMap(emitters);
    }
}
