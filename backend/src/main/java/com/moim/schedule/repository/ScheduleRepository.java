package com.moim.schedule.repository;

import com.moim.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByRoomIdOrderByEventDateAsc(Long roomId);

    @Query("SELECT s FROM Schedule s WHERE s.eventDate = :date AND s.eventTime BETWEEN :from AND :to")
    List<Schedule> findByDateAndTimeWindow(@Param("date") LocalDate date,
                                           @Param("from") LocalTime from,
                                           @Param("to") LocalTime to);

    List<Schedule> findByEventDate(LocalDate date);
}
