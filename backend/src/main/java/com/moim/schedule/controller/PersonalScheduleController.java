package com.moim.schedule.controller;

import com.moim.room.entity.RoomMember;
import com.moim.room.repository.RoomMemberRepository;
import com.moim.room.repository.RoomRepository;
import com.moim.schedule.entity.Schedule;
import com.moim.schedule.repository.ScheduleRepository;
import com.moim.schedule.service.ScheduleService;
import com.moim.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class PersonalScheduleController {

    private final ScheduleService scheduleService;
    private final ScheduleRepository scheduleRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Schedule>> getPersonalSchedules(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(scheduleService.getPersonalSchedules(user.getId()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Schedule>> getAllSchedules(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(scheduleService.getAllSchedulesForUser(user.getId()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingSchedules(@AuthenticationPrincipal User user) {
        List<Long> roomIds = roomMemberRepository.findByUserId(user.getId()).stream()
                .filter(m -> m.getStatus() == RoomMember.Status.APPROVED)
                .map(RoomMember::getRoomId)
                .collect(Collectors.toList());
        if (roomIds.isEmpty()) return ResponseEntity.ok(List.of());

        Map<Long, String> roomNames = roomRepository.findAllById(roomIds).stream()
                .collect(Collectors.toMap(r -> r.getId(), r -> r.getName()));

        return ResponseEntity.ok(
            scheduleRepository.findByRoomIdInAndEventDateGreaterThanEqualOrderByEventDateAsc(roomIds, LocalDate.now())
                .stream().map(s -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", s.getId());
                    m.put("title", s.getTitle());
                    m.put("eventDate", s.getEventDate().toString());
                    m.put("eventTime", s.getEventTime() != null ? s.getEventTime().toString() : null);
                    m.put("location", s.getLocation());
                    m.put("roomId", s.getRoomId());
                    m.put("roomName", roomNames.getOrDefault(s.getRoomId(), ""));
                    return m;
                }).collect(Collectors.toList())
        );
    }

    @PostMapping
    public ResponseEntity<Schedule> createPersonalSchedule(@RequestBody Map<String, String> body,
                                                           @AuthenticationPrincipal User user) {
        LocalDate eventDate = LocalDate.parse(body.get("eventDate"));
        LocalTime eventTime = body.get("eventTime") != null && !body.get("eventTime").isEmpty()
                ? LocalTime.parse(body.get("eventTime")) : null;
        Schedule schedule = scheduleService.createPersonalSchedule(
                user.getId(),
                body.get("title"),
                body.get("description"),
                eventDate, eventTime,
                body.get("location")
        );
        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<Schedule> updatePersonalSchedule(@PathVariable Long scheduleId,
                                                           @RequestBody Map<String, String> body) {
        LocalDate eventDate = LocalDate.parse(body.get("eventDate"));
        LocalTime eventTime = body.get("eventTime") != null && !body.get("eventTime").isEmpty()
                ? LocalTime.parse(body.get("eventTime")) : null;
        Schedule schedule = scheduleService.updateSchedule(
                scheduleId,
                body.get("title"),
                body.get("description"),
                eventDate, eventTime,
                body.get("location")
        );
        return ResponseEntity.ok(schedule);
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deletePersonalSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok().build();
    }
}
