package com.example.fashionstore.controller;

import com.example.fashionstore.entity.Review;
import com.example.fashionstore.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Admin: lấy tất cả đánh giá (mọi sản phẩm) để duyệt/xóa
    @GetMapping
    public ResponseEntity<List<Review>> getAll() {
        return ResponseEntity.ok(reviewService.findAll());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.findByProduct(productId));
    }

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getSummary(productId));
    }

    @PostMapping
    public ResponseEntity<Review> create(@Valid @RequestBody Review review, Authentication authentication) {
        return ResponseEntity.ok(reviewService.create(review, authentication.getName()));
    }

    // Admin: xóa đánh giá vi phạm
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}