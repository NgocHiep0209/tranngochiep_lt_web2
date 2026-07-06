package com.example.fashionstore.controller;

import com.example.fashionstore.entity.Post;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // Public: danh sách bài viết active
    @GetMapping("/active")
    public ResponseEntity<List<Post>> getActive() {
        return ResponseEntity.ok(postService.findActive());
    }

    // Public: chi tiết bài viết
    @GetMapping("/{id}")
    public ResponseEntity<Post> getById(@PathVariable Long id) {
        Post post = postService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
        return ResponseEntity.ok(post);
    }

    // ==== Admin: quản lý bài viết ====

    // Admin: lấy tất cả bài viết (kể cả inactive)
    @GetMapping
    public ResponseEntity<List<Post>> getAll() {
        return ResponseEntity.ok(postService.findAll());
    }

    @PostMapping
    public ResponseEntity<Post> create(@Valid @RequestBody Post post) {
        return ResponseEntity.ok(postService.save(post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> update(@PathVariable Long id, @Valid @RequestBody Post post) {
        return ResponseEntity.ok(postService.update(id, post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
