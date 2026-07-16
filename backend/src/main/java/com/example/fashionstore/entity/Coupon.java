package com.example.fashionstore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã giảm giá, luôn lưu dạng chữ hoa để so sánh không phân biệt hoa/thường
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    // PERCENT: giảm theo phần trăm (0-100) | FIXED: giảm số tiền cố định (VNĐ)
    @Column(nullable = false, length = 20)
    private String discountType;

    // Với PERCENT: giá trị 0-100. Với FIXED: số tiền VNĐ.
    @Column(nullable = false)
    private Double discountValue;

    // Giảm tối đa (áp dụng cho loại PERCENT, để tránh giảm quá nhiều). Null = không giới hạn.
    private Double maxDiscountAmount;

    // Giá trị đơn hàng tối thiểu để được áp dụng mã. Null/0 = không yêu cầu.
    private Double minOrderAmount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    // Tổng số lượt được phép sử dụng. Null = không giới hạn.
    private Integer usageLimit;

    // Số lượt đã sử dụng thực tế
    @Column(nullable = false)
    private Integer usedCount;

    @Column(nullable = false)
    private Boolean active;

    @PrePersist
    public void prePersist() {
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
        if (this.usedCount == null) {
            this.usedCount = 0;
        }
        if (this.active == null) {
            this.active = true;
        }
    }
}
