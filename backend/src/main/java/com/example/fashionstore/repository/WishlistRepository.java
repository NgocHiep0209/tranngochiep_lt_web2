package com.example.fashionstore.repository;

import com.example.fashionstore.entity.Wishlist;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Wishlist> findByCustomerIdAndProductId(Long customerId, Long productId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    void deleteByCustomerIdAndProductId(Long customerId, Long productId);

    // Đếm số lượt yêu thích theo từng sản phẩm, sắp xếp giảm dần -> dùng cho
    // trang chủ hiển thị "Sản phẩm được yêu thích nhất".
    @Query("SELECT w.productId AS productId, COUNT(w) AS favoriteCount " +
            "FROM Wishlist w GROUP BY w.productId ORDER BY COUNT(w) DESC")
    List<ProductFavoriteCount> findTopFavoritedProductIds(Pageable pageable);

    interface ProductFavoriteCount {
        Long getProductId();
        Long getFavoriteCount();
    }
}
