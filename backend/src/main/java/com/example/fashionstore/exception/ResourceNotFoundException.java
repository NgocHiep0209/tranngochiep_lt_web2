package com.example.fashionstore.exception;

/**
 * Ném ra khi không tìm thấy resource theo id (Product, Category, Order, Customer...).
 * Được GlobalExceptionHandler bắt và trả về HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
