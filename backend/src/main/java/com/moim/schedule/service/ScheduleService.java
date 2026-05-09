package com.moim.schedule.service;

import com.moim.schedule.entity.Schedule;
import com.moim.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public List<Schedule> getSchedules(Long roomId) {
        return scheduleRepository.findByRoomIdOrderByEventDateAsc(roomId);
    }

    @Transactional
    public Schedule createSchedule(Long roomId, Long userId, String title, String description,
                                    LocalDate eventDate, LocalTime eventTime, String location) {
        Schedule schedule = Schedule.builder()
                .roomId(roomId)
                .createdBy(userId)
                .title(title)
                .description(description)
                .eventDate(eventDate)
                .eventTime(eventTime)
                .location(location)
                .build();
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public Schedule updateSchedule(Long scheduleId, String title, String description,
                                   LocalDate eventDate, LocalTime eventTime, String location) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        schedule.setTitle(title);
        schedule.setDescription(description);
        schedule.setEventDate(eventDate);
        schedule.setEventTime(eventTime);
        schedule.setLocation(location);
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }

    public List<Schedule> getPersonalSchedules(Long userId) {
        return scheduleRepository.findByCreatedByAndRoomIdIsNullOrderByEventDateAsc(userId);
    }

    @Transactional
    public Schedule createPersonalSchedule(Long userId, String title, String description,
                                           LocalDate eventDate, LocalTime eventTime, String location) {
        Schedule schedule = Schedule.builder()
                .roomId(null)
                .createdBy(userId)
                .title(title)
                .description(description)
                .eventDate(eventDate)
                .eventTime(eventTime)
                .location(location)
                .build();
        return scheduleRepository.save(schedule);
    }
}
