package com.example.fashionstore.controller;

import com.example.fashionstore.entity.Product;
import com.example.fashionstore.entity.Wishlist;
import com.example.fashionstore.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Đa số path /api/wishlist/** tự động rơi vào .anyRequest().authenticated()
// ở cuối chain -> chỉ cần đăng nhập (USER hoặc ADMIN đều dùng được).
// Riêng /api/wishlist/most-favorited được khai báo permitAll() trong
// SecurityConfig vì đây là dữ liệu công khai hiển thị ở trang chủ.
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/my")
    public ResponseEntity<List<Wishlist>> getMyWishlist(Authentication authentication) {
        return ResponseEntity.ok(wishlistService.findMyWishlist(authentication.getName()));
    }

    @GetMapping("/my/ids")
    public ResponseEntity<List<Long>> getMyWishlistProductIds(Authentication authentication) {
        return ResponseEntity.ok(wishlistService.findMyWishlistProductIds(authentication.getName()));
    }

    // Public - dùng cho trang chủ, không cần đăng nhập
    @GetMapping("/most-favorited")
    public ResponseEntity<List<Product>> getMostFavorited(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(wishlistService.findMostFavorited(limit));
    }

    @PostMapping
    public ResponseEntity<Wishlist> add(@RequestBody Map<String, Long> body, Authentication authentication) {
        Long productId = body.get("productId");
        return ResponseEntity.ok(wishlistService.add(authentication.getName(), productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@PathVariable Long productId, Authentication authentication) {
        wishlistService.remove(authentication.getName(), productId);
        return ResponseEntity.noContent().build();
    }
}
