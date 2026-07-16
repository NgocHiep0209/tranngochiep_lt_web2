package com.example.fashionstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCouponResponse {
    private Long couponId;
    private String code;
    private String description;
    private String discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minOrderAmount;
    private LocalDateTime endDate;
    private Boolean claimed;   // khách này đã nhận mã này chưa
    private Boolean used;      // đã dùng cho 1 đơn hàng chưa (chỉ có ý nghĩa khi claimed = true)
}
