package com.moim.ai;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AiRateLimiter {

    private static final int LIMIT = 10;
    private static final long WINDOW_MS = 24 * 60 * 60 * 1000L;

    private final ConcurrentHashMap<Long, List<Long>> log = new ConcurrentHashMap<>();

    public boolean allow(Long userId) {
        long now = Instant.now().toEpochMilli();
        long cutoff = now - WINDOW_MS;

        List<Long> calls = log.computeIfAbsent(userId, k -> new ArrayList<>());
        synchronized (calls) {
            calls.removeIf(t -> t < cutoff);
            if (calls.size() >= LIMIT) return false;
            calls.add(now);
            return true;
        }
    }

    public int remaining(Long userId) {
        long cutoff = Instant.now().toEpochMilli() - WINDOW_MS;
        List<Long> calls = log.getOrDefault(userId, List.of());
        synchronized (calls) {
            long used = calls.stream().filter(t -> t >= cutoff).count();
            return Math.max(0, LIMIT - (int) used);
        }
    }

    public int getLimit() {
        return LIMIT;
    }
}
