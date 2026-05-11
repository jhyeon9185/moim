package com.moim.auth.service;

import com.moim.auth.dto.*;
import com.moim.auth.entity.EmailVerification;
import com.moim.auth.entity.PasswordResetToken;
import com.moim.auth.repository.EmailVerificationRepository;
import com.moim.auth.repository.PasswordResetTokenRepository;
import com.moim.config.JwtProvider;
import com.moim.user.entity.User;
import com.moim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final LoginRateLimiter rateLimiter;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ─── 이메일 인증 코드 발송 ─────────────────────────────────────
    @Transactional
    public String prepareVerificationCode(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        emailVerificationRepository.deleteByEmail(email);

        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        emailVerificationRepository.save(EmailVerification.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build());

        return code;
    }

    @Transactional
    public void sendVerificationCode(String email) {
        String code = prepareVerificationCode(email);
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendVerificationCode(email, code);
            } catch (Exception e) {
                log.error("인증 코드 이메일 발송 실패: {}", email, e);
            }
        });
    }

    // ─── 인증 코드 확인 ───────────────────────────────────────────
    @Transactional
    public void verifyEmailCode(String email, String code) {
        EmailVerification ev = emailVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("인증 코드를 먼저 요청해주세요."));

        if (ev.isVerified()) throw new IllegalArgumentException("이미 인증된 이메일입니다.");
        if (LocalDateTime.now().isAfter(ev.getExpiresAt())) throw new IllegalArgumentException("인증 코드가 만료되었습니다. 다시 요청해주세요.");
        if (!ev.getCode().equals(code)) throw new IllegalArgumentException("인증 코드가 올바르지 않습니다.");

        ev.setVerified(true);
    }

    // ─── 회원가입 ──────────────────────────────────────────────────
    @Transactional
    public TokenResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        boolean verified = emailVerificationRepository
                .existsByEmailAndVerifiedTrueAndCreatedAtAfter(request.getEmail(), LocalDateTime.now().minusMinutes(30));
        if (!verified) {
            throw new IllegalArgumentException("이메일 인증이 필요합니다.");
        }

        if (!request.isPrivacyPolicyAgreed()) {
            throw new IllegalArgumentException("개인정보처리방침에 동의해야 합니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(User.Role.USER)
                .provider(User.AuthProvider.LOCAL)
                .nicknameSet(true)
                .privacyPolicyAgreed(true)
                .build();

        userRepository.save(user);
        emailVerificationRepository.deleteByEmail(request.getEmail());

        String token = jwtProvider.createToken(user.getId(), user.getEmail());
        return new TokenResponse(token);
    }

    // ─── 로그인 (Rate Limiting + 계정 잠금) ───────────────────────
    @Transactional
    public TokenResponse login(LoginRequest request, String ip) {
        if (rateLimiter.isBlocked(ip)) {
            throw new IllegalArgumentException("너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.");
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null || user.getPassword() == null) {
            rateLimiter.record(ip);
            throw new IllegalArgumentException("이메일 또는 비밀번호를 확인해주세요.");
        }

        if (user.getLockUntil() != null && LocalDateTime.now().isBefore(user.getLockUntil())) {
            long minutes = ChronoUnit.MINUTES.between(LocalDateTime.now(), user.getLockUntil());
            throw new IllegalArgumentException("계정이 잠겼습니다. " + (minutes + 1) + "분 후 다시 시도해주세요.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            rateLimiter.record(ip);
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setLockUntil(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);
                throw new IllegalArgumentException("로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.");
            }
            userRepository.save(user);
            throw new IllegalArgumentException("이메일 또는 비밀번호를 확인해주세요. (" + (5 - attempts) + "회 남음)");
        }

        rateLimiter.clear(ip);
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        userRepository.save(user);

        String token = jwtProvider.createToken(user.getId(), user.getEmail());
        return new TokenResponse(token);
    }

    // ─── 비밀번호 재설정 이메일 발송 ──────────────────────────────
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        // 유저가 없어도 동일한 응답 (이메일 열거 공격 방지)
        if (user == null || user.getProvider() != User.AuthProvider.LOCAL) return;

        passwordResetTokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .email(email)
                .token(token)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .build());

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendPasswordReset(email, resetLink);
            } catch (Exception e) {
                log.error("비밀번호 재설정 이메일 발송 실패: {}", email, e);
            }
        });
    }

    // ─── 비밀번호 재설정 ──────────────────────────────────────────
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 링크입니다."));

        if (prt.isUsed()) throw new IllegalArgumentException("이미 사용된 링크입니다.");
        if (LocalDateTime.now().isAfter(prt.getExpiresAt())) throw new IllegalArgumentException("링크가 만료되었습니다. 다시 요청해주세요.");

        User user = userRepository.findByEmail(prt.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        userRepository.save(user);

        prt.setUsed(true);
    }

    // ─── OAuth 로그인 ─────────────────────────────────────────────
    @Transactional
    public TokenResponse oauthLogin(String provider, String email, String nickname, String providerId, String profileImage) {
        User.AuthProvider authProvider = User.AuthProvider.valueOf(provider.toUpperCase());

        final String userEmail = (email == null || email.trim().isEmpty())
                ? providerId + "@" + provider.toLowerCase() + ".com"
                : email;

        boolean[] isNew = {false};

        User user = userRepository.findByProviderAndProviderId(authProvider, providerId)
                .orElseGet(() -> {
                    User existing = userRepository.findByEmail(userEmail).orElse(null);
                    if (existing != null) {
                        existing.setProvider(authProvider);
                        existing.setProviderId(providerId);
                        if (profileImage != null) existing.setProfileImage(profileImage);
                        return userRepository.save(existing);
                    }
                    isNew[0] = true;
                    return userRepository.save(User.builder()
                            .email(userEmail)
                            .nickname(nickname)
                            .provider(authProvider)
                            .providerId(providerId)
                            .profileImage(profileImage)
                            .privacyPolicyAgreed(true)
                            .build());
                });

        String token = jwtProvider.createToken(user.getId(), user.getEmail());
        return new TokenResponse(token, isNew[0]);
    }
}
