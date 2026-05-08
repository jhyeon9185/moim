package com.moim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = "com.moim")
@EnableJpaRepositories(basePackages = "com.moim")
public class MoimApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoimApplication.class, args);
    }
}
