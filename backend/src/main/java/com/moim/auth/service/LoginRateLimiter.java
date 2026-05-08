package com.moim.auth.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_MS = 10 * 60 * 1000L; // 10분

    private final Map<String, Deque<Long>> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String ip) {
        long now = System.currentTimeMillis();
        Deque<Long> times = attempts.get(ip);
        if (times == null) return false;
        purge(times, now);
        return times.size() >= MAX_ATTEMPTS;
    }

    public void record(String ip) {
        attempts.computeIfAbsent(ip, k -> new ArrayDeque<>())
                .addLast(System.currentTimeMillis());
    }

    public void clear(String ip) {
        attempts.remove(ip);
    }

    private void purge(Deque<Long> times, long now) {
        while (!times.isEmpty() && now - times.peekFirst() > WINDOW_MS) {
            times.pollFirst();
        }
    }

    @Scheduled(fixedRate = 600_000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        attempts.values().forEach(times -> purge(times, now));
        attempts.entrySet().removeIf(e -> e.getValue().isEmpty());
    }
}
