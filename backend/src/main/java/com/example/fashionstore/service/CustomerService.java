package com.example.fashionstore.service;

import com.example.fashionstore.dto.LoginRequest;
import com.example.fashionstore.dto.LoginResponse;
import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.exception.BadRequestException;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.CustomerRepository;
import com.example.fashionstore.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer register(Customer customer) {
        Optional<Customer> existing = customerRepository.findByEmail(customer.getEmail());
        if (existing.isPresent()) {
            throw new BadRequestException("Email đã được đăng ký!");
        }
        customer.setRole("USER");
        // Mã hóa mật khẩu BCrypt
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        return customerRepository.save(customer);
    }

    public LoginResponse login(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại!"));

        // So sánh mật khẩu BCrypt
        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new BadRequestException("Mật khẩu không đúng!");
        }

        // Tạo JWT token
        String token = jwtUtil.generateToken(customer.getId(), customer.getEmail(), customer.getRole());

        return new LoginResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getRole(),
                token
        );
    }

    // Admin thêm thành viên mới
    public Customer create(Customer customer) {
        Optional<Customer> existing = customerRepository.findByEmail(customer.getEmail());
        if (existing.isPresent()) {
            throw new BadRequestException("Email đã tồn tại!");
        }
        if (customer.getRole() == null || customer.getRole().isBlank()) {
            customer.setRole("USER");
        }
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        return customerRepository.save(customer);
    }

    public Customer update(Long id, Customer updated) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên với id: " + id));

        if (!existing.getEmail().equalsIgnoreCase(updated.getEmail())) {
            customerRepository.findByEmail(updated.getEmail()).ifPresent(c -> {
                throw new BadRequestException("Email đã tồn tại!");
            });
        }

        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        if (updated.getRole() != null && !updated.getRole().isBlank()) {
            existing.setRole(updated.getRole());
        }
        // Chỉ cập nhật mật khẩu nếu admin nhập mật khẩu mới
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updated.getPassword()));
        }
        return customerRepository.save(existing);
    }

    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy thành viên với id: " + id);
        }
        customerRepository.deleteById(id);
    }
}
