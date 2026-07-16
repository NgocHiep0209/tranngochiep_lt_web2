package com.example.fashionstore.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

// Ghi lại việc 1 khách hàng đã "nhận" (lưu về ví) 1 mã giảm giá,
// để hiển thị lại đúng những voucher khách đã nhận ở trang thanh toán.
@Entity
@Table(name = "customer_coupons", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"customer_id", "coupon_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    private LocalDateTime claimedAt;

    // Đã dùng cho 1 đơn hàng thành công hay chưa (voucher đã nhận chỉ dùng được 1 lần/khách)
    @Column(nullable = false)
    private Boolean used;

    @PrePersist
    public void prePersist() {
        this.claimedAt = LocalDateTime.now();
        if (this.used == null) {
            this.used = false;
        }
    }
}
