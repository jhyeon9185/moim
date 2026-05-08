package com.moim.user.controller;

import com.moim.notification.NotificationService;
import com.moim.notification.SseEmitterStore;
import com.moim.room.entity.RoomMember;
import com.moim.room.repository.RoomMemberRepository;
import com.moim.room.repository.RoomRepository;
import com.moim.user.entity.User;
import com.moim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final NotificationService notificationService;
    private final SseEmitterStore emitterStore;

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("email", u.getEmail());
            m.put("nickname", u.getNickname());
            m.put("role", u.getRole().name());
            m.put("provider", u.getProvider().name());
            m.put("profileImage", u.getProfileImage() != null ? u.getProfileImage() : "");
            m.put("createdAt", u.getCreatedAt().toString());
            return m;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Map<String, Object>>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll().stream().map(r -> {
            int memberCount = (int) roomMemberRepository.findByRoomId(r.getId()).stream()
                    .filter(m -> m.getStatus() == RoomMember.Status.APPROVED).count();
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("name", r.getName());
            map.put("ownerId", r.getOwnerId());
            map.put("memberCount", memberCount);
            map.put("createdAt", r.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/rooms/{id}/members")
    public ResponseEntity<List<Map<String, Object>>> getRoomMembers(@PathVariable Long id) {
        return ResponseEntity.ok(
            roomMemberRepository.findByRoomId(id).stream()
                .filter(m -> m.getStatus() == RoomMember.Status.APPROVED || m.getStatus() == RoomMember.Status.PENDING)
                .map(m -> {
                    User user = userRepository.findById(m.getUserId()).orElse(null);
                    if (user == null) return null;
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", m.getUserId());
                    map.put("nickname", user.getNickname());
                    map.put("email", user.getEmail());
                    map.put("role", m.getRole().name());
                    map.put("status", m.getStatus().name());
                    map.put("profileImage", user.getProfileImage() != null ? user.getProfileImage() : "");
                    return map;
                })
                .filter(m -> m != null)
                .collect(Collectors.toList())
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/rooms/{roomId}/members/{userId}")
    public ResponseEntity<Void> kickMember(@PathVariable Long roomId, @PathVariable Long userId) {
        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));
        if (member.getRole() == RoomMember.Role.OWNER) {
            throw new IllegalArgumentException("방장은 추방할 수 없습니다. 모임방 삭제를 이용하세요.");
        }
        roomMemberRepository.delete(member);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<Map<String, Object>> broadcast(@RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "모임 알림");
        String message = body.getOrDefault("body", "");
        int connected = emitterStore.getAll().size();
        notificationService.sendToAll(title, message);
        Map<String, Object> result = new HashMap<>();
        result.put("sent", connected);
        result.put("message", connected + "명에게 알림을 발송했습니다.");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/notifications/connected")
    public ResponseEntity<Map<String, Object>> connectedCount() {
        return ResponseEntity.ok(Map.of("count", emitterStore.getAll().size()));
    }
}
