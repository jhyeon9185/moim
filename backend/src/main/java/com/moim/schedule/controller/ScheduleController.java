package com.moim.schedule.controller;

import com.moim.schedule.entity.Schedule;
import com.moim.schedule.service.ScheduleService;
import com.moim.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms/{roomId}/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<Schedule>> getSchedules(@PathVariable Long roomId) {
        return ResponseEntity.ok(scheduleService.getSchedules(roomId));
    }

    @PostMapping
    public ResponseEntity<Schedule> createSchedule(@PathVariable Long roomId,
                                                   @RequestBody Map<String, String> body,
                                                   @AuthenticationPrincipal User user) {
        LocalDate eventDate = LocalDate.parse(body.get("eventDate"));
        LocalTime eventTime = body.get("eventTime") != null && !body.get("eventTime").isEmpty()
                ? LocalTime.parse(body.get("eventTime")) : null;

        Schedule schedule = scheduleService.createSchedule(
                roomId, user.getId(),
                body.get("title"),
                body.get("description"),
                eventDate, eventTime,
                body.get("location")
        );
        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<Schedule> updateSchedule(@PathVariable Long roomId,
                                                   @PathVariable Long scheduleId,
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
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long roomId,
                                               @PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok().build();
    }
}
