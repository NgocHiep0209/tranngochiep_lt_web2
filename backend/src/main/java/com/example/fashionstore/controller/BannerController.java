package com.example.fashionstore.controller;

import com.example.fashionstore.entity.Banner;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.service.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // Dùng cho trang chủ (user) - chỉ lấy banner đang active
    @GetMapping("/active")
    public ResponseEntity<List<Banner>> getActive() {
        return ResponseEntity.ok(bannerService.findActive());
    }

    // ==== Các API dưới đây dành cho khu vực quản trị (Admin) - quản lý banner ====

    @GetMapping
    public ResponseEntity<List<Banner>> getAll() {
        return ResponseEntity.ok(bannerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getById(@PathVariable Long id) {
        Banner banner = bannerService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));
        return ResponseEntity.ok(banner);
    }

    @PostMapping
    public ResponseEntity<Banner> create(@Valid @RequestBody Banner banner) {
        return ResponseEntity.ok(bannerService.save(banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> update(@PathVariable Long id, @Valid @RequestBody Banner banner) {
        return ResponseEntity.ok(bannerService.update(id, banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
