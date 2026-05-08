package com.moim.notification;

import com.moim.notification.entity.NotificationSetting;
import com.moim.notification.repository.NotificationSettingRepository;
import com.moim.room.entity.RoomMember;
import com.moim.room.repository.RoomMemberRepository;
import com.moim.schedule.entity.Schedule;
import com.moim.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final ScheduleRepository scheduleRepository;
    private final NotificationSettingRepository settingRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 60_000)
    public void checkNotifications() {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
        checkTimedAlerts(now, 60, "alert1h", "1시간 후");
        checkTimedAlerts(now, 180, "alert3h", "3시간 후");
        checkDayBeforeAlerts(now);
    }

    private void checkTimedAlerts(LocalDateTime now, int alertMinutes, String alertType, String label) {
        // Find schedules happening in [now+alertMinutes-1min, now+alertMinutes+1min]
        LocalDateTime target = now.plusMinutes(alertMinutes);
        LocalDate targetDate = target.toLocalDate();
        LocalTime from = target.minusMinutes(1).toLocalTime();
        LocalTime to = target.plusMinutes(1).toLocalTime();

        List<Schedule> schedules = scheduleRepository.findByDateAndTimeWindow(targetDate, from, to);
        for (Schedule schedule : schedules) {
            notifyRoomMembers(schedule, alertType, label);
        }
    }

    // Day-before alert fires at 08:00 AM every day
    private void checkDayBeforeAlerts(LocalDateTime now) {
        if (now.getHour() != 8 || now.getMinute() > 1) return;

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Schedule> schedules = scheduleRepository.findByEventDate(tomorrow);
        for (Schedule schedule : schedules) {
            notifyRoomMembers(schedule, "alertDay", "내일");
        }
    }

    private void notifyRoomMembers(Schedule schedule, String alertType, String timeLabel) {
        List<NotificationSetting> settings = settingRepository.findByRoomIdAndEnabledTrue(schedule.getRoomId());

        for (NotificationSetting setting : settings) {
            boolean shouldAlert = switch (alertType) {
                case "alert1h" -> setting.isAlert1h();
                case "alert3h" -> setting.isAlert3h();
                case "alertDay" -> setting.isAlertDay();
                default -> false;
            };
            if (!shouldAlert) continue;

            // Verify user is still an approved member
            roomMemberRepository.findByRoomIdAndUserId(schedule.getRoomId(), setting.getUserId())
                    .filter(m -> m.getStatus() == RoomMember.Status.APPROVED)
                    .ifPresent(m -> notificationService.send(
                            setting.getUserId(),
                            "📅 " + schedule.getTitle(),
                            timeLabel + " 일정이 있어요" + (schedule.getLocation() != null ? " · " + schedule.getLocation() : "")
                    ));
        }
    }
}
