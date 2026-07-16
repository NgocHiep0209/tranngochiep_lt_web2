package com.example.fashionstore.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;

    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, length = 20)
    private String customerPhone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String customerAddress;

    private LocalDateTime orderDate;

    @Column(nullable = false, length = 50)
    private String status;

    private Double totalAmount;

    // Mã giảm giá đã áp dụng cho đơn hàng này (nếu có)
    @Column(length = 50)
    private String couponCode;

    // Số tiền đã được giảm nhờ voucher (0 nếu không dùng mã)
    private Double discountAmount;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetails;

    @PrePersist
    public void prePersist() {
        this.orderDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = "pending";
        }
    }
}
