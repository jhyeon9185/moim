package com.moim.notification;

import com.moim.config.JwtProvider;
import com.moim.notification.entity.NotificationSetting;
import com.moim.notification.repository.NotificationSettingRepository;
import com.moim.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SseEmitterStore emitterStore;
    private final NotificationSettingRepository settingRepository;
    private final JwtProvider jwtProvider;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam("token") String token) {
        if (!jwtProvider.validateToken(token)) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }
        Long userId = jwtProvider.getUserId(token);

        SseEmitter emitter = new SseEmitter(0L);
        emitterStore.add(userId, emitter);
        emitter.onCompletion(() -> emitterStore.remove(userId));
        emitter.onTimeout(() -> emitterStore.remove(userId));
        emitter.onError(e -> emitterStore.remove(userId));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            emitter.complete();
        }

        return emitter;
    }

    @GetMapping("/settings/{roomId}")
    public ResponseEntity<NotificationSetting> getSetting(@PathVariable Long roomId,
                                                          @AuthenticationPrincipal User user) {
        NotificationSetting setting = settingRepository
                .findByUserIdAndRoomId(user.getId(), roomId)
                .orElse(NotificationSetting.builder()
                        .userId(user.getId())
                        .roomId(roomId)
                        .build());
        return ResponseEntity.ok(setting);
    }

    @PutMapping("/settings/{roomId}")
    public ResponseEntity<NotificationSetting> upsertSetting(@PathVariable Long roomId,
                                                              @RequestBody Map<String, Boolean> body,
                                                              @AuthenticationPrincipal User user) {
        NotificationSetting setting = settingRepository
                .findByUserIdAndRoomId(user.getId(), roomId)
                .orElse(NotificationSetting.builder()
                        .userId(user.getId())
                        .roomId(roomId)
                        .build());

        if (body.containsKey("enabled"))  setting.setEnabled(body.get("enabled"));
        if (body.containsKey("alert1h"))  setting.setAlert1h(body.get("alert1h"));
        if (body.containsKey("alert3h"))  setting.setAlert3h(body.get("alert3h"));
        if (body.containsKey("alertDay")) setting.setAlertDay(body.get("alertDay"));

        return ResponseEntity.ok(settingRepository.save(setting));
    }
}
