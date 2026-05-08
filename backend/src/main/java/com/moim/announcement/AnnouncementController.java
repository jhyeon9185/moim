package com.moim.announcement;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    @GetMapping("/api/announcements/active")
    public ResponseEntity<Announcement> getActive() {
        return announcementRepository.findTopByActiveTrueOrderByCreatedAtDesc()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/api/admin/announcements")
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(announcementRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/api/admin/announcements")
    public ResponseEntity<Announcement> create(@RequestBody Map<String, Object> body) {
        Announcement a = Announcement.builder()
                .content((String) body.get("content"))
                .active(Boolean.TRUE.equals(body.get("active")))
                .build();
        return ResponseEntity.ok(announcementRepository.save(a));
    }

    @PutMapping("/api/admin/announcements/{id}")
    public ResponseEntity<Announcement> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지를 찾을 수 없습니다."));
        if (body.containsKey("content")) a.setContent((String) body.get("content"));
        if (body.containsKey("active")) a.setActive(Boolean.TRUE.equals(body.get("active")));
        return ResponseEntity.ok(announcementRepository.save(a));
    }

    @DeleteMapping("/api/admin/announcements/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
