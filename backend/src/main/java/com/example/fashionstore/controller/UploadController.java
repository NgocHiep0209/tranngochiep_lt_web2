package com.example.fashionstore.controller;

import com.example.fashionstore.exception.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final String UPLOAD_DIR = "uploads";

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ảnh để upload");
        }
        String contentType = file.getContentType();
        // contentType có thể null nếu request không đúng định dạng multipart/form-data
        // (VD: frontend gửi nhầm Content-Type: application/json). Set.of(...).contains(null)
        // sẽ ném NullPointerException -> lỗi 500 khó hiểu, nên phải kiểm tra null trước.
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Ảnh không được vượt quá 5MB");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String ext = getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + ext;
            file.transferTo(uploadPath.resolve(fileName));

            String url = "http://localhost:8080/uploads/" + fileName;
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu ảnh: " + e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}