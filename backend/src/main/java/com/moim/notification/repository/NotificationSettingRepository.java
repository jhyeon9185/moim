package com.moim.notification.repository;

import com.moim.notification.entity.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {
    Optional<NotificationSetting> findByUserIdAndRoomId(Long userId, Long roomId);
    List<NotificationSetting> findByRoomIdAndEnabledTrue(Long roomId);

    @Query("SELECT COUNT(DISTINCT ns.userId) FROM NotificationSetting ns WHERE ns.enabled = true")
    long countDistinctUsersWithNotificationsEnabled();
}
