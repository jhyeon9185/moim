package com.moim.room.dto;

import lombok.Data;

@Data
public class RoomListResponse {
    private Long roomId;
    private String roomName;
    private String status;
    private String role;
    private int memberCount;
    private int pendingCount;

    public RoomListResponse(Long roomId, String roomName, String status, String role, int memberCount, int pendingCount) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.status = status;
        this.role = role;
        this.memberCount = memberCount;
        this.pendingCount = pendingCount;
    }
}
