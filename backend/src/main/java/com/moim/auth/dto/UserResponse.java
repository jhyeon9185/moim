package com.moim.auth.dto;

import com.moim.user.entity.User;
import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String provider;
    private String profileImage;
    private String role;
    private boolean nicknameSet;
    private boolean pushEnabled;
    private boolean emailNotificationEnabled;
    private boolean alert1h;
    private boolean alert3h;
    private boolean alertDay;

    public static UserResponse from(User user) {
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setNickname(user.getNickname());
        res.setProvider(user.getProvider().name());
        res.setProfileImage(user.getProfileImage());
        res.setRole(user.getRole().name());
        res.setNicknameSet(user.isNicknameSet());
        res.setPushEnabled(user.isPushEnabled());
        res.setEmailNotificationEnabled(user.isEmailNotificationEnabled());
        res.setAlert1h(user.isAlert1h());
        res.setAlert3h(user.isAlert3h());
        res.setAlertDay(user.isAlertDay());
        return res;
    }
}
