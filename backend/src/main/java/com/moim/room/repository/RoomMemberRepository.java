package com.moim.room.repository;

import com.moim.room.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    List<RoomMember> findByUserId(Long userId);
    List<RoomMember> findByRoomId(Long roomId);
    Optional<RoomMember> findByRoomIdAndUserId(Long roomId, Long userId);
    boolean existsByRoomIdAndUserId(Long roomId, Long userId);
}
