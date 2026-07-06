package com.example.fashionstore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tiêu đề banner không được để trống")
    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 255)
    private String subtitle;

    @NotBlank(message = "Ảnh banner không được để trống")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    // Đường dẫn khi người dùng bấm vào banner (ví dụ: /products?category=1)
    @Column(length = 255)
    private String linkUrl;

    // Thứ tự hiển thị, số nhỏ hơn hiển thị trước
    private Integer displayOrder = 0;

    // Chỉ banner active mới hiển thị ngoài trang chủ
    private Boolean active = true;
}
