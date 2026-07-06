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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
            .authorizeHttpRequests(auth -> auth
                // ===== PUBLIC: xem sản phẩm, danh mục, banner, bài viết =====
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/banners/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                // Đăng ký, đăng nhập (cả user lẫn admin)
                .requestMatchers("/api/customers/register", "/api/customers/login").permitAll()
                // Đặt hàng không cần đăng nhập
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()

                // ===== Đơn hàng của tôi: chỉ cần đăng nhập (USER hoặc ADMIN đều được) =====
                // PHẢI đặt TRƯỚC dòng hasRole("ADMIN") của /api/orders/** ở dưới
                .requestMatchers(HttpMethod.GET, "/api/orders/my").authenticated()

                // ===== CHỈ ADMIN: quản lý sản phẩm =====
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                // ===== CHỈ ADMIN: quản lý danh mục =====
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                // ===== CHỈ ADMIN: quản lý banner =====
                .requestMatchers(HttpMethod.GET, "/api/banners").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/banners/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/banners/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/banners/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/banners/**").hasRole("ADMIN")

                // ===== CHỈ ADMIN: quản lý bài viết =====
                .requestMatchers(HttpMethod.POST, "/api/posts/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/posts/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/posts/**").hasRole("ADMIN")

                // ===== CHỈ ADMIN: xem danh sách khách hàng, quản lý đơn hàng =====
                .requestMatchers("/api/customers").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/customers").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/orders", "/api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasRole("ADMIN")


                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/upload").hasRole("ADMIN")

                    
                // ===== CHỈ ADMIN: xem tất cả đánh giá & xóa đánh giá vi phạm =====
                .requestMatchers(HttpMethod.GET, "/api/reviews").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").hasRole("ADMIN")
                 .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}