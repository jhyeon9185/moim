package com.moim.oauth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    @Value("${oauth.kakao.client-id}")
    private String clientId;

    @Value("${oauth.kakao.client-secret}")
    private String clientSecret;

    @Value("${oauth.kakao.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getUserInfo(String code) {
        // 1. 액세스 토큰 발급
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        if (clientSecret != null && !clientSecret.isEmpty()) {
            params.add("client_secret", clientSecret);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        System.out.println("Sending token request to Kakao with clientId: " + clientId + " and redirectUri: " + redirectUri);
        Map tokenResponse;
        try {
            tokenResponse = restTemplate.postForObject(tokenUrl, request, Map.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Kakao Token API Error: " + e.getResponseBodyAsString());
            throw e;
        }

        String accessToken = (String) tokenResponse.get("access_token");

        // 2. 유저 정보 조회
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);

        HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
        ResponseEntity<Map> userResponse = restTemplate.exchange(
                userInfoUrl, HttpMethod.GET, userRequest, Map.class);

        return userResponse.getBody();
    }

    public String extractEmail(Map<String, Object> userInfo) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");
        return kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
    }

    public String extractNickname(Map<String, Object> userInfo) {
        Map<String, Object> properties = (Map<String, Object>) userInfo.get("properties");
        return properties != null ? (String) properties.get("nickname") : "카카오 유저";
    }

    public String extractProfileImage(Map<String, Object> userInfo) {
        Map<String, Object> properties = (Map<String, Object>) userInfo.get("properties");
        return properties != null ? (String) properties.get("profile_image") : null;
    }

    public String extractProviderId(Map<String, Object> userInfo) {
        return String.valueOf(userInfo.get("id"));
    }
}
