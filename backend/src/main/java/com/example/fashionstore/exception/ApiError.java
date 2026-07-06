package com.example.fashionstore.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Cấu trúc JSON trả về thống nhất cho mọi lỗi từ API,
 * để frontend luôn đọc lỗi theo cùng 1 định dạng.
 *
 * Ví dụ:
 * {
 *   "timestamp": "2026-07-03T10:00:00",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "message": "Email đã được đăng ký!",
 *   "path": "/api/customers/register",
 *   "fieldErrors": { "email": "Email không hợp lệ" }   // chỉ có khi lỗi validation
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private int status;
    private String error;
    private String message;
    private String path;

    /** Chỉ có khi lỗi @Valid: field -> thông báo lỗi tương ứng */
    private Map<String, String> fieldErrors;
}
