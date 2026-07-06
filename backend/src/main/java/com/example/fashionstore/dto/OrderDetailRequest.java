package com.example.fashionstore.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderDetailRequest {

    @NotNull(message = "productId không được để trống")
    private Long productId;

    private String productName;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải >= 1")
    private Integer quantity;

    // unitPrice do server tự lấy từ giá sản phẩm hiện tại trong DB,
    // không tin tưởng giá client gửi lên để tránh gian lận giá.
    private Double unitPrice;
}
