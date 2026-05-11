package com.moim.user.controller;

import com.moim.user.entity.User;
import com.moim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.moim.room.repository.RoomMemberRepository roomMemberRepository;
    private final com.moim.schedule.repository.ScheduleRepository scheduleRepository;

    @GetMapping("/stats")
    public ResponseEntity<com.moim.user.dto.UserStatsResponse> getUserStats(@AuthenticationPrincipal User user) {
        List<com.moim.room.entity.RoomMember> memberships = roomMemberRepository.findByUserId(user.getId());
        List<Long> approvedRoomIds = memberships.stream()
                .filter(m -> m.getStatus() == com.moim.room.entity.RoomMember.Status.APPROVED)
                .map(com.moim.room.entity.RoomMember::getRoomId)
                .toList();

        int totalMoments = 0;
        if (!approvedRoomIds.isEmpty()) {
            totalMoments = scheduleRepository.findByRoomIdInAndEventDateGreaterThanEqualOrderByEventDateAsc(
                    approvedRoomIds, java.time.LocalDate.now().minusYears(1)).size();
        }

        long totalConnections = memberships.stream()
                .filter(m -> m.getStatus() == com.moim.room.entity.RoomMember.Status.APPROVED)
                .flatMap(m -> roomMemberRepository.findByRoomId(m.getRoomId()).stream())
                .filter(m -> m.getStatus() == com.moim.room.entity.RoomMember.Status.APPROVED)
                .map(com.moim.room.entity.RoomMember::getUserId)
                .filter(id -> !id.equals(user.getId()))
                .distinct()
                .count();

        return ResponseEntity.ok(com.moim.user.dto.UserStatsResponse.builder()
                .totalMoments(totalMoments)
                .momentsSub("최근 1년 기준")
                .totalConnections((int) totalConnections)
                .connectionsSub("함께 활동 중인 멤버")
                .build());
    }

    @PutMapping("/me/nickname")
    public ResponseEntity<Void> updateNickname(@RequestBody Map<String, String> body,
                                               @AuthenticationPrincipal User user) {
        String newNickname = body.get("nickname");
        if (newNickname == null || newNickname.trim().isEmpty()) {
            throw new IllegalArgumentException("닉네임을 입력해주세요.");
        }
        if (newNickname.trim().length() > 16) {
            throw new IllegalArgumentException("닉네임은 16자 이하로 입력해주세요.");
        }

        user.setNickname(newNickname);
        user.setNicknameSet(true);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/profile-image")
    public ResponseEntity<Map<String, String>> updateProfileImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {

        Path uploadDir = Paths.get("uploads/profiles");
        Files.createDirectories(uploadDir);

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : ".jpg";
        String filename = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "/uploads/profiles/" + filename;
        user.setProfileImage(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("profileImage", imageUrl));
    }

    @PutMapping("/me/notifications")
    public ResponseEntity<Void> updateNotifications(@RequestBody Map<String, Boolean> body,
                                                    @AuthenticationPrincipal User user) {
        if (body.containsKey("pushEnabled")) {
            user.setPushEnabled(body.get("pushEnabled"));
        }
        if (body.containsKey("emailNotificationEnabled")) {
            user.setEmailNotificationEnabled(body.get("emailNotificationEnabled"));
        }
        if (body.containsKey("alert1h")) {
            user.setAlert1h(body.get("alert1h"));
        }
        if (body.containsKey("alert3h")) {
            user.setAlert3h(body.get("alert3h"));
        }
        if (body.containsKey("alertDay")) {
            user.setAlertDay(body.get("alertDay"));
        }
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}
