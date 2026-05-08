package com.moim.notification.repository;

import com.moim.notification.entity.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {
    Optional<NotificationSetting> findByUserIdAndRoomId(Long userId, Long roomId);
    List<NotificationSetting> findByRoomIdAndEnabledTrue(Long roomId);
}
