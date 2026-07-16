package com.example.fashionstore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Column(nullable = false, length = 200)
    private String name;

    @NotNull(message = "Giá không được để trống")
    @PositiveOrZero(message = "Giá phải >= 0")
    @Column(nullable = false)
    private Double price;

    @PositiveOrZero(message = "Giá cũ phải >= 0")
    private Double oldPrice;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @PositiveOrZero(message = "Số lượng tồn kho phải >= 0")
    private Integer stockQuantity;

    @Column(length = 100)
    private String size;

    @Column(length = 100)
    private String color;

    @Column(length = 100)
    private String material;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    // Không lưu DB, chỉ gắn thêm khi trả về danh sách "sản phẩm được yêu thích nhất"
    // để FE hiển thị số lượt yêu thích (giống cách Wishlist gắn thêm productName).
    @Transient
    private Long favoriteCount;
}
