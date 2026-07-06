package com.example.fashionstore.exception;

/**
 * Ném ra khi request hợp lệ về mặt cú pháp nhưng vi phạm nghiệp vụ
 * (VD: email đã tồn tại, sai mật khẩu). GlobalExceptionHandler trả về HTTP 400.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
