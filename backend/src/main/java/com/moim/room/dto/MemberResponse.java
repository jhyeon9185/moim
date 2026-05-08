package com.moim.room.dto;

import lombok.Data;

@Data
public class MemberResponse {
    private Long userId;
    private String nickname;
    private String profileImage;
    private String role;
    private String status;

    public MemberResponse(Long userId, String nickname, String profileImage, String role, String status) {
        this.userId = userId;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.role = role;
        this.status = status;
    }
}
