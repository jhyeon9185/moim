package com.moim.auth.dto;

import lombok.Data;

@Data
public class OAuthRequest {
    private String provider; // "kakao" or "google"
    private String code;     // authorization code
}
