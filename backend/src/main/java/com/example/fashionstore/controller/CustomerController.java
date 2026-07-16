package com.example.fashionstore.controller;

import com.example.fashionstore.dto.ChangePasswordRequest;
import com.example.fashionstore.dto.LoginRequest;
import com.example.fashionstore.dto.LoginResponse;
import com.example.fashionstore.dto.UpdateProfileRequest;
import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // Admin: lấy tất cả thành viên
    @GetMapping
    public ResponseEntity<List<Customer>> getAll() {
        return ResponseEntity.ok(customerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        Customer customer = customerService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên với id: " + id));
        return ResponseEntity.ok(customer);
    }

    // Đăng ký (public)
    @PostMapping("/register")
    public ResponseEntity<Customer> register(@Valid @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.register(customer));
    }

    // Đăng nhập (public) - trả về JWT token
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(customerService.login(request));
    }

    // ===== Tự phục vụ: khách hàng đang đăng nhập xem/sửa thông tin của chính mình =====

    // Lấy thông tin của chính mình (đọc lại từ DB, không tin dữ liệu cũ trong localStorage)
    @GetMapping("/me")
    public ResponseEntity<Customer> getMe(Authentication authentication) {
        return ResponseEntity.ok(customerService.findByEmail(authentication.getName()));
    }

    // Cập nhật họ tên / SĐT / địa chỉ của chính mình
    @PutMapping("/me")
    public ResponseEntity<Customer> updateMe(Authentication authentication,
                                              @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(customerService.updateOwnProfile(authentication.getName(), request));
    }

    // Đổi mật khẩu của chính mình
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changeMyPassword(Authentication authentication,
                                                                  @Valid @RequestBody ChangePasswordRequest request) {
        customerService.changeOwnPassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }

    // Admin: thêm thành viên mới
    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.create(customer));
    }

    // Admin: cập nhật thành viên
    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.update(id, customer));
    }

    // Admin: xóa thành viên
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
