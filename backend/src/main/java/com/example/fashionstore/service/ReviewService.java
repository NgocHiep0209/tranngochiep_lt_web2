package com.example.fashionstore.service;

import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.entity.Review;
import com.example.fashionstore.exception.BadRequestException;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.CustomerRepository;
import com.example.fashionstore.repository.ProductRepository;
import com.example.fashionstore.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public List<Review> findByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    // Admin: lấy tất cả đánh giá (mọi sản phẩm), kèm tên sản phẩm để hiển thị, mới nhất trước
    public List<Review> findAll() {
        List<Review> reviews = reviewRepository.findAll();
        reviews.sort(Comparator.comparing(Review::getCreatedAt).reversed());
        reviews.forEach(r -> productRepository.findById(r.getProductId())
                .ifPresent(p -> r.setProductName(p.getName())));
        return reviews;
    }

    // Admin: xóa đánh giá vi phạm
    public void delete(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy đánh giá với id: " + id);
        }
        reviewRepository.deleteById(id);
    }

    public Map<String, Object> getSummary(Long productId) {
        List<Review> reviews = findByProduct(productId);
        double average = reviews.isEmpty() ? 0 :
                reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        return Map.of(
                "average", Math.round(average * 10) / 10.0,
                "count", reviews.size()
        );
    }

    public Review create(Review review, String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

        boolean alreadyReviewed = reviewRepository.findByProductIdOrderByCreatedAtDesc(review.getProductId())
                .stream().anyMatch(r -> customer.getId().equals(r.getCustomerId()));
        if (alreadyReviewed) {
            throw new BadRequestException("Bạn đã đánh giá sản phẩm này rồi");
        }

        review.setCustomerId(customer.getId());
        review.setCustomerName(customer.getFullName());
        return reviewRepository.save(review);
    }
}