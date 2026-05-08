package com.moim.auth.controller;

import com.moim.auth.dto.*;
import com.moim.auth.service.AuthService;
import com.moim.oauth.GoogleOAuthService;
import com.moim.oauth.KakaoOAuthService;
import com.moim.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final KakaoOAuthService kakaoOAuthService;
    private final GoogleOAuthService googleOAuthService;

    @PostMapping("/send-verification")
    public ResponseEntity<Void> sendVerification(@RequestBody Map<String, String> body) {
        authService.sendVerificationCode(body.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestBody Map<String, String> body) {
        authService.verifyEmailCode(body.get("email"), body.get("code"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    public ResponseEntity<TokenResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest servletRequest) {
        String ip = getClientIp(servletRequest);
        return ResponseEntity.ok(authService.login(request, ip));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("newPassword"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/oauth")
    public ResponseEntity<TokenResponse> oauth(@RequestBody OAuthRequest request) {
        String provider = request.getProvider().toLowerCase();
        String code = request.getCode();

        String email, nickname, providerId, profileImage;

        if ("kakao".equals(provider)) {
            Map<String, Object> userInfo = kakaoOAuthService.getUserInfo(code);
            email = kakaoOAuthService.extractEmail(userInfo);
            nickname = kakaoOAuthService.extractNickname(userInfo);
            providerId = kakaoOAuthService.extractProviderId(userInfo);
            profileImage = kakaoOAuthService.extractProfileImage(userInfo);
        } else if ("google".equals(provider)) {
            Map<String, Object> userInfo = googleOAuthService.getUserInfo(code);
            email = googleOAuthService.extractEmail(userInfo);
            nickname = googleOAuthService.extractNickname(userInfo);
            providerId = googleOAuthService.extractProviderId(userInfo);
            profileImage = googleOAuthService.extractProfileImage(userInfo);
        } else {
            return ResponseEntity.badRequest().build();
        }

        TokenResponse token = authService.oauthLogin(provider, email, nickname, providerId, profileImage);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(UserResponse.from(user));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return ip.split(",")[0].trim();
    }
}
