package com.example.fashionstore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "wishlists", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"customer_id", "product_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @NotNull(message = "Thiếu sản phẩm")
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Không lưu DB, chỉ để trả kèm thông tin sản phẩm cho FE hiển thị (tương tự Review.productName)
    @Transient
    private String productName;

    @Transient
    private String productImageUrl;

    @Transient
    private Double productPrice;

    @Transient
    private Double productOldPrice;

    @Transient
    private Integer productStockQuantity;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
