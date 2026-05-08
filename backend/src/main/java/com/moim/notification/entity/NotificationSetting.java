package com.moim.notification.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_settings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "room_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Builder.Default
    private boolean enabled = true;

    @Builder.Default
    private boolean alert1h = true;

    @Builder.Default
    private boolean alert3h = false;

    @Builder.Default
    private boolean alertDay = false;
}
