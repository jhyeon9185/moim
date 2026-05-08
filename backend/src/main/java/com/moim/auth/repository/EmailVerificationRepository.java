package com.moim.auth.repository;

import com.moim.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findTopByEmailOrderByCreatedAtDesc(String email);
    boolean existsByEmailAndVerifiedTrueAndCreatedAtAfter(String email, LocalDateTime after);
    void deleteByEmail(String email);
}
