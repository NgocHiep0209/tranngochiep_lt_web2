package com.example.fashionstore.repository;

import com.example.fashionstore.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByActiveTrueOrderByCreatedAtDesc();
    List<Post> findAllByOrderByCreatedAtDesc();
}
