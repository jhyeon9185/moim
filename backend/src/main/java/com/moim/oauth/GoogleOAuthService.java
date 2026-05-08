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
public class GoogleOAuthService {

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.client-secret}")
    private String clientSecret;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getUserInfo(String code) {
        try {
            // 1. 액세스 토큰 발급
            String tokenUrl = "https://oauth2.googleapis.com/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("code", code);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            Map tokenResponse;
            try {
                tokenResponse = restTemplate.postForObject(tokenUrl, request, Map.class);
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                System.err.println("Google Token API Error: " + e.getResponseBodyAsString());
                throw new RuntimeException("Google token request failed: " + e.getResponseBodyAsString());
            }

            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new RuntimeException("Google token response is empty or invalid: " + tokenResponse);
            }

            String accessToken = (String) tokenResponse.get("access_token");

            // 2. 유저 정보 조회
            String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);

            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, userRequest, Map.class);

            return userResponse.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Google OAuth failed: " + e.getMessage());
        }
    }

    public String extractEmail(Map<String, Object> userInfo) {
        return (String) userInfo.get("email");
    }

    public String extractNickname(Map<String, Object> userInfo) {
        return (String) userInfo.get("name");
    }

    public String extractProfileImage(Map<String, Object> userInfo) {
        return (String) userInfo.get("picture");
    }

    public String extractProviderId(Map<String, Object> userInfo) {
        return String.valueOf(userInfo.get("id"));
    }
}
