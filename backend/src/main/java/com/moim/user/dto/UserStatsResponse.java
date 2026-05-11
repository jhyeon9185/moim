package com.moim.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsResponse {
    private int totalMoments;
    private String momentsSub;
    private int totalConnections;
    private String connectionsSub;
}
