package com.example.fashionstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    private Long customerId;

    @NotBlank(message = "Họ tên người nhận không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String customerPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String customerAddress;

    private String note;

    // Mã giảm giá khách nhập lúc checkout (tùy chọn)
    private String couponCode;

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
    @Valid
    private List<OrderDetailRequest> orderDetails;
}
