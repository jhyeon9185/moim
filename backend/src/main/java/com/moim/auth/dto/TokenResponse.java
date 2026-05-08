package com.moim.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String token;
    private boolean isNewUser;
    
    public TokenResponse(String token) {
        this.token = token;
        this.isNewUser = false;
    }
}
