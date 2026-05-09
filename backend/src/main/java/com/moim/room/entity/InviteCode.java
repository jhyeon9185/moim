package com.moim.room.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "invite_codes")
@SQLDelete(sql = "UPDATE invite_codes SET is_deleted = true WHERE id=?")
@SQLRestriction("is_deleted = false")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private Long createdBy;

    @Column(unique = true, nullable = false, length = 8)
    private String code;

    @Builder.Default
    private boolean used = false;

    private Long usedBy;

    @Builder.Default
    @Column(nullable = false)
    private boolean isDeleted = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime expiresAt;

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isAvailable() {
        return !isExpired() && !isDeleted;
    }
}
