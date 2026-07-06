package com.example.fashionstore.service;

import com.example.fashionstore.entity.Post;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    // Lấy tất cả bài viết đang active (dùng cho trang user)
    public List<Post> findActive() {
        return postRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    // Admin: lấy tất cả bài viết
    public List<Post> findAll() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Post> findById(Long id) {
        return postRepository.findById(id);
    }

    public Post save(Post post) {
        return postRepository.save(post);
    }

    public Post update(Long id, Post updated) {
        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
        existing.setTitle(updated.getTitle());
        existing.setSummary(updated.getSummary());
        existing.setContent(updated.getContent());
        existing.setImageUrl(updated.getImageUrl());
        existing.setAuthor(updated.getAuthor());
        existing.setActive(updated.getActive());
        return postRepository.save(existing);
    }

    public void delete(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id);
        }
        postRepository.deleteById(id);
    }
}
