package com.example.fashionstore.exception;

/**
 * Ném ra khi đặt hàng với số lượng vượt quá tồn kho hiện có.
 * GlobalExceptionHandler trả về HTTP 409 (Conflict).
 */
public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }
}
