package com.example.fashionstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {
    private String code;
    private Double discountAmount;
    private Double finalAmount;
    private String message;
}
