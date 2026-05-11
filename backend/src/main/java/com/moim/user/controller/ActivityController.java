package com.moim.user.controller;

import com.moim.user.dto.ActivityResponse;
import com.moim.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityResponse>> getRecentActivities(@AuthenticationPrincipal User user) {
        // 임시 목업 데이터 반환 (추후 실제 활동 로그 구현 가능)
        List<ActivityResponse> activities = new ArrayList<>();
        activities.add(ActivityResponse.builder()
                .id("1")
                .user(user.getNickname())
                .action("모임에 접속했습니다.")
                .time("방금 전")
                .color("coral")
                .build());
        
        return ResponseEntity.ok(activities);
    }
}
