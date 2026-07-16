package com.example.fashionstore.service;

import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.entity.Product;
import com.example.fashionstore.entity.Wishlist;
import com.example.fashionstore.exception.BadRequestException;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.CustomerRepository;
import com.example.fashionstore.repository.ProductRepository;
import com.example.fashionstore.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    private Customer requireCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));
    }

    // Danh sách yêu thích của khách hàng đang đăng nhập, kèm thông tin sản phẩm để FE hiển thị luôn
    // (giống cách ReviewService.findAll() gắn thêm productName cho Admin).
    public List<Wishlist> findMyWishlist(String email) {
        Customer customer = requireCustomer(email);
        List<Wishlist> items = wishlistRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId());
        items.forEach(w -> productRepository.findById(w.getProductId()).ifPresent(p -> {
            w.setProductName(p.getName());
            w.setProductImageUrl(p.getImageUrl());
            w.setProductPrice(p.getPrice());
            w.setProductOldPrice(p.getOldPrice());
            w.setProductStockQuantity(p.getStockQuantity());
        }));
        return items;
    }

    // Chỉ trả về danh sách productId đã yêu thích - nhẹ, dùng để tô màu icon trái tim
    // trên ProductCard/ProductDetailPage mà không cần tải cả object sản phẩm.
    public List<Long> findMyWishlistProductIds(String email) {
        Customer customer = requireCustomer(email);
        return wishlistRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream().map(Wishlist::getProductId).toList();
    }

    public Wishlist add(String email, Long productId) {
        Customer customer = requireCustomer(email);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId));

        if (wishlistRepository.existsByCustomerIdAndProductId(customer.getId(), productId)) {
            throw new BadRequestException("Sản phẩm đã có trong danh sách yêu thích");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setCustomerId(customer.getId());
        wishlist.setProductId(product.getId());
        return wishlistRepository.save(wishlist);
    }

    public void remove(String email, Long productId) {
        Customer customer = requireCustomer(email);
        wishlistRepository.deleteByCustomerIdAndProductId(customer.getId(), productId);
    }

    // Danh sách sản phẩm được yêu thích nhiều nhất (public, dùng cho trang chủ).
    // Đếm số lượt "thêm vào yêu thích" của từng sản phẩm rồi lấy top N.
    public List<Product> findMostFavorited(int limit) {
        List<WishlistRepository.ProductFavoriteCount> counts =
                wishlistRepository.findTopFavoritedProductIds(PageRequest.of(0, limit));

        List<Product> result = new ArrayList<>();
        for (WishlistRepository.ProductFavoriteCount c : counts) {
            productRepository.findById(c.getProductId()).ifPresent(p -> {
                p.setFavoriteCount(c.getFavoriteCount());
                result.add(p);
            });
        }
        return result;
    }
}
