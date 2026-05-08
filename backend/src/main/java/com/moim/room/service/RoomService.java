package com.moim.room.service;

import com.moim.room.dto.MemberResponse;
import com.moim.room.dto.RoomListResponse;
import com.moim.room.entity.*;
import com.moim.room.repository.*;
import com.moim.user.entity.User;
import com.moim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final UserRepository userRepository;

    @Transactional
    public Room createRoom(String name, Long userId) {
        Room room = Room.builder()
                .name(name)
                .ownerId(userId)
                .build();
        roomRepository.save(room);

        // 생성자를 OWNER + APPROVED로 추가
        RoomMember member = RoomMember.builder()
                .roomId(room.getId())
                .userId(userId)
                .role(RoomMember.Role.OWNER)
                .status(RoomMember.Status.APPROVED)
                .build();
        roomMemberRepository.save(member);

        return room;
    }

    public List<RoomListResponse> getUserRooms(Long userId) {
        List<RoomMember> memberships = roomMemberRepository.findByUserId(userId);

        return memberships.stream().map(m -> {
            Room room = roomRepository.findById(m.getRoomId()).orElse(null);
            if (room == null) return null;

            List<RoomMember> allMembers = roomMemberRepository.findByRoomId(m.getRoomId());

            int memberCount = (int) allMembers.stream()
                    .filter(rm -> rm.getStatus() == RoomMember.Status.APPROVED).count();

            int pendingCount = m.getRole() == RoomMember.Role.OWNER
                    ? (int) allMembers.stream().filter(rm -> rm.getStatus() == RoomMember.Status.PENDING).count()
                    : 0;

            return new RoomListResponse(
                    room.getId(),
                    room.getName(),
                    m.getStatus().name(),
                    m.getRole().name(),
                    memberCount,
                    pendingCount
            );
        }).filter(r -> r != null).toList();
    }

    public Room getRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));
    }

    public List<MemberResponse> getMembers(Long roomId) {
        List<RoomMember> members = roomMemberRepository.findByRoomId(roomId);

        return members.stream().map(m -> {
            User user = userRepository.findById(m.getUserId()).orElse(null);
            if (user == null) return null;
            return new MemberResponse(
                    user.getId(),
                    user.getNickname(),
                    user.getProfileImage(),
                    m.getRole().name(),
                    m.getStatus().name()
            );
        }).filter(m -> m != null).toList();
    }

    @Transactional
    public void approveMember(Long roomId, Long userId, Long requesterId) {
        Room room = getRoom(roomId);
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("요청자를 찾을 수 없습니다."));

        if (!room.getOwnerId().equals(requesterId) && requester.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("방장 또는 관리자만 승인할 수 있습니다.");
        }

        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        member.setStatus(RoomMember.Status.APPROVED);
        roomMemberRepository.save(member);
    }

    @Transactional
    public void rejectMember(Long roomId, Long userId, Long requesterId) {
        Room room = getRoom(roomId);
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("요청자를 찾을 수 없습니다."));

        if (!room.getOwnerId().equals(requesterId) && requester.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("방장 또는 관리자만 거절할 수 있습니다.");
        }

        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        member.setStatus(RoomMember.Status.REJECTED);
        roomMemberRepository.save(member);
    }

    @Transactional
    public void cancelJoin(Long roomId, Long userId) {
        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("참가 신청을 찾을 수 없습니다."));
        roomMemberRepository.delete(member);
    }

    @Transactional
    public void deleteRoom(Long roomId, Long requesterId) {
        Room room = getRoom(roomId);
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("요청자를 찾을 수 없습니다."));

        if (!room.getOwnerId().equals(requesterId) && requester.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("방장 또는 관리자만 모임을 삭제할 수 있습니다.");
        }

        roomRepository.delete(room); // Soft delete applied via @SQLDelete
        
        // Members are also deleted logically if we manually delete them
        List<RoomMember> members = roomMemberRepository.findByRoomId(roomId);
        roomMemberRepository.deleteAll(members);
    }

    // 초대 코드 생성 (멤버 전원 가능)
    @Transactional
    public InviteCode generateInviteCode(Long roomId, Long userId) {
        // 멤버인지 확인
        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("모임 멤버만 초대할 수 있습니다."));

        if (member.getStatus() != RoomMember.Status.APPROVED) {
            throw new IllegalArgumentException("승인된 멤버만 초대할 수 있습니다.");
        }

        String code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        InviteCode inviteCode = InviteCode.builder()
                .roomId(roomId)
                .createdBy(userId)
                .code(code)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        return inviteCodeRepository.save(inviteCode);
    }

    // 초대 코드로 가입 신청
    @Transactional
    public void joinByInviteCode(String code, Long userId) {
        InviteCode inviteCode = inviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        if (!inviteCode.isAvailable()) {
            throw new IllegalArgumentException("만료되었거나 이미 사용된 코드입니다.");
        }

        // 이미 멤버인지 확인
        if (roomMemberRepository.existsByRoomIdAndUserId(inviteCode.getRoomId(), userId)) {
            throw new IllegalArgumentException("이미 참가한 모임입니다.");
        }

        // 코드 사용 처리
        inviteCode.setUsed(true);
        inviteCode.setUsedBy(userId);
        inviteCodeRepository.save(inviteCode);

        // PENDING 상태로 멤버 추가
        RoomMember member = RoomMember.builder()
                .roomId(inviteCode.getRoomId())
                .userId(userId)
                .role(RoomMember.Role.MEMBER)
                .status(RoomMember.Status.PENDING)
                .build();
        roomMemberRepository.save(member);
    }
}
