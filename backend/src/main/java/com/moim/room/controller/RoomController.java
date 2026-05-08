package com.moim.room.controller;

import com.moim.room.dto.MemberResponse;
import com.moim.room.dto.RoomListResponse;
import com.moim.room.entity.InviteCode;
import com.moim.room.entity.Room;
import com.moim.room.service.RoomService;
import com.moim.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomListResponse>> myRooms(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(roomService.getUserRooms(user.getId()));
    }

    @PostMapping("/rooms")
    public ResponseEntity<Room> createRoom(@RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal User user) {
        Room room = roomService.createRoom(body.get("name"), user.getId());
        return ResponseEntity.ok(room);
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<Map<String, Object>> getRoom(@PathVariable Long id) {
        Room room = roomService.getRoom(id);
        return ResponseEntity.ok(Map.of(
                "id", room.getId(),
                "name", room.getName(),
                "ownerId", room.getOwnerId(),
                "createdAt", room.getCreatedAt().toString()
        ));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id,
                                           @AuthenticationPrincipal User user) {
        roomService.deleteRoom(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/rooms/{id}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getMembers(id));
    }

    @PatchMapping("/rooms/{id}/members/{userId}")
    public ResponseEntity<Void> approveMember(@PathVariable Long id,
                                              @PathVariable Long userId,
                                              @AuthenticationPrincipal User user) {
        roomService.approveMember(id, userId, user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/rooms/{id}/members/{userId}")
    public ResponseEntity<Void> rejectMember(@PathVariable Long id,
                                             @PathVariable Long userId,
                                             @AuthenticationPrincipal User user) {
        roomService.rejectMember(id, userId, user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/rooms/{id}/members/me")
    public ResponseEntity<Void> cancelJoin(@PathVariable Long id,
                                           @AuthenticationPrincipal User user) {
        roomService.cancelJoin(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/rooms/{id}/invite")
    public ResponseEntity<Map<String, String>> generateInvite(@PathVariable Long id,
                                                              @AuthenticationPrincipal User user) {
        InviteCode code = roomService.generateInviteCode(id, user.getId());
        return ResponseEntity.ok(Map.of("code", code.getCode()));
    }

    @PostMapping("/invite/join")
    public ResponseEntity<Void> joinByCode(@RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal User user) {
        roomService.joinByInviteCode(body.get("code"), user.getId());
        return ResponseEntity.ok().build();
    }
}
