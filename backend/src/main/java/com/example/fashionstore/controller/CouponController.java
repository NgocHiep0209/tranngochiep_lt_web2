package com.example.fashionstore.controller;

import com.example.fashionstore.dto.CouponValidationResponse;
import com.example.fashionstore.dto.CustomerCouponResponse;
import com.example.fashionstore.entity.Coupon;
import com.example.fashionstore.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // ===== CHỈ ADMIN: quản lý mã giảm giá =====
    @GetMapping
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(couponService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Coupon> create(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.create(coupon));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> update(@PathVariable Long id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.update(id, coupon));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===== PUBLIC: khách hàng kiểm tra mã lúc checkout (chưa trừ lượt dùng) =====
    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validate(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        Double orderAmount = body.get("orderAmount") != null
                ? Double.valueOf(body.get("orderAmount").toString())
                : 0d;
        return ResponseEntity.ok(couponService.validate(code, orderAmount));
    }

    // ===== Voucher center: hiển thị ở thanh điều hướng để khách "nhận" mã =====
    @GetMapping("/available")
    public ResponseEntity<List<CustomerCouponResponse>> getAvailable(
            @RequestParam(required = false) Long customerId) {
        return ResponseEntity.ok(couponService.getClaimableCoupons(customerId));
    }

    @PostMapping("/claim")
    public ResponseEntity<CustomerCouponResponse> claim(@RequestBody Map<String, Object> body) {
        Long customerId = body.get("customerId") != null ? Long.valueOf(body.get("customerId").toString()) : null;
        Long couponId = body.get("couponId") != null ? Long.valueOf(body.get("couponId").toString()) : null;
        return ResponseEntity.ok(couponService.claimCoupon(customerId, couponId));
    }

    // ===== Ví voucher của khách - hiển thị ở trang thanh toán để chọn áp mã =====
    @GetMapping("/my")
    public ResponseEntity<List<CustomerCouponResponse>> getMyCoupons(@RequestParam Long customerId) {
        return ResponseEntity.ok(couponService.getMyCoupons(customerId));
    }
}
