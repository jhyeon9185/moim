package com.moim.config;

import com.moim.user.entity.User;
import com.moim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@admin.com")) {
            User admin = User.builder()
                    .email("admin@admin.com")
                    .password(passwordEncoder.encode("960310"))
                    .nickname("최고관리자")
                    .role(User.Role.ADMIN)
                    .provider(User.AuthProvider.LOCAL)
                    .nicknameSet(true)
                    .build();
            userRepository.save(admin);
        }
    }
}
