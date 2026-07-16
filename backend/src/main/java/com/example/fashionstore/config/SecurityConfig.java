package com.example.fashionstore.config;

import com.example.fashionstore.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpStatus;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Trả 401 (không phải 403) khi chưa đăng nhập hoặc token hết hạn/không hợp lệ,
            // để frontend phân biệt được "cần đăng nhập lại" với "không đủ quyền".
            .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .authorizeHttpRequests(auth -> auth
                // ===== PUBLIC: xem sản phẩm, danh mục, banner, bài viết =====
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/banners/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                // Top sản phẩm được yêu thích nhất - hiển thị công khai ở trang chủ
                .requestMatchers(HttpMethod.GET, "/api/wishlist/most-favorited").permitAll()
                // Đăng ký, đăng nhập (cả user lẫn admin)
                .requestMatchers("/api/customers/register", "/api/customers/login").permitAll()
                // Đặt hàng không cần đăng nhập
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                // Kiểm tra mã giảm giá lúc checkout - không cần đăng nhập
                .requestMatchers(HttpMethod.POST, "/api/coupons/validate").permitAll()
                // Voucher center (thanh điều hướng): ai cũng xem được danh sách voucher để nhận
                // PHẢI đặt TRƯỚC dòng hasRole("ADMIN") của /api/coupons/** ở dưới
                .requestMatchers(HttpMethod.GET, "/api/coupons/available").permitAll()
                // Ví voucher của khách - chỉ cần đăng nhập (không cần quyền ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/coupons/my").authenticated()

                // ===== Đơn hàng của tôi: chỉ cần đăng nhập (USER hoặc ADMIN/STAFF đều được) =====
                // PHẢI đặt TRƯỚC dòng hasRole("ADMIN") của /api/orders/** ở dưới
                .requestMatchers(HttpMethod.GET, "/api/orders/my").authenticated()

                // ===== Tài khoản của tôi: xem/sửa thông tin, đổi mật khẩu - chỉ cần đăng nhập =====
                // PHẢI đặt TRƯỚC các dòng hasRole("ADMIN") của /api/customers/** ở dưới
                .requestMatchers(HttpMethod.GET, "/api/customers/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/customers/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/customers/me/password").authenticated()

                // ===== ADMIN + STAFF: quản lý sản phẩm =====
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("ADMIN", "STAFF")

                // ===== ADMIN + STAFF: quản lý danh mục =====
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAnyRole("ADMIN", "STAFF")

                // ===== ADMIN + STAFF: quản lý banner =====
                .requestMatchers(HttpMethod.GET, "/api/banners").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.GET, "/api/banners/{id}").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.POST, "/api/banners/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/banners/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/banners/**").hasAnyRole("ADMIN", "STAFF")

                // ===== ADMIN + STAFF: quản lý bài viết =====
                .requestMatchers(HttpMethod.POST, "/api/posts/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/posts/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/posts/**").hasAnyRole("ADMIN", "STAFF")

                // ===== CHỈ ADMIN: xem/tạo/sửa/xóa thành viên (bao gồm cấp quyền STAFF/ADMIN) =====
                .requestMatchers("/api/customers").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/customers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/customers").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasRole("ADMIN")

                // ===== ADMIN + STAFF: xem/cập nhật đơn hàng =====
                .requestMatchers(HttpMethod.GET, "/api/orders", "/api/orders/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasAnyRole("ADMIN", "STAFF")

                // ===== CHỈ ADMIN: quản lý mã giảm giá / voucher =====
                .requestMatchers(HttpMethod.GET, "/api/coupons", "/api/coupons/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/coupons").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/coupons/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/coupons/**").hasRole("ADMIN")


                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/upload").hasAnyRole("ADMIN", "STAFF")

                    
                // ===== ADMIN + STAFF: xem tất cả đánh giá & xóa đánh giá vi phạm =====
                .requestMatchers(HttpMethod.GET, "/api/reviews").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").hasAnyRole("ADMIN", "STAFF")
                 .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                // ===== CHAT: khách hàng chat với admin/nhân viên =====
                // Khách hàng: chỉ thao tác trên cuộc trò chuyện của chính mình -> chỉ cần đăng nhập
                .requestMatchers("/api/chat/my", "/api/chat/my/**").authenticated()
                // Admin/Staff: xem/danh sách/nhắn tin cho MỌI khách hàng
                .requestMatchers("/api/chat/conversations", "/api/chat/customer/**").hasAnyRole("ADMIN", "STAFF")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}