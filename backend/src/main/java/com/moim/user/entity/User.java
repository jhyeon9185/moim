package com.moim.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET is_deleted = true WHERE id=?")
@SQLRestriction("is_deleted = false")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password; // nullable for social login

    @Column(nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    private String providerId;

    private String profileImage;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Builder.Default
    @Column(nullable = false)
    private boolean isDeleted = false;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int failedLoginAttempts = 0;

    private java.time.LocalDateTime lockUntil;

    @Builder.Default
    @Column(nullable = false)
    private boolean nicknameSet = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean pushEnabled = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean emailNotificationEnabled = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean alert1h = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean alert3h = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean alertDay = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean privacyPolicyAgreed = false;

    public enum AuthProvider {
        LOCAL, KAKAO, GOOGLE
    }

    public enum Role {
        USER, ADMIN
    }
}
