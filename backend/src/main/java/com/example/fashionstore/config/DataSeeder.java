package com.example.fashionstore.config;

import com.example.fashionstore.entity.Banner;
import com.example.fashionstore.entity.Category;
import com.example.fashionstore.entity.Coupon;
import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.entity.Post;
import com.example.fashionstore.entity.Product;
import com.example.fashionstore.repository.BannerRepository;
import com.example.fashionstore.repository.CategoryRepository;
import com.example.fashionstore.repository.CouponRepository;
import com.example.fashionstore.repository.CustomerRepository;
import com.example.fashionstore.repository.PostRepository;
import com.example.fashionstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Sinh dữ liệu mẫu khi khởi động ứng dụng.
 *
 * QUAN TRỌNG: mỗi bảng chỉ được seed nếu đang RỖNG (count() == 0).
 * => Chạy lại (restart) bao nhiêu lần cũng không tạo dữ liệu trùng lặp,
 *    khác với cách cũ dùng data.sql (spring.sql.init.mode=always) vốn
 *    chèn lại dữ liệu mỗi lần khởi động vì các cột name/title không có
 *    ràng buộc UNIQUE nên "ON DUPLICATE KEY UPDATE" không có tác dụng.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BannerRepository bannerRepository;
    private final PostRepository postRepository;
    private final CustomerRepository customerRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<Category> categories = seedCategories();
        seedProducts(categories);
        seedBanners();
        seedPosts();
        seedAdmin();
        seedStaff();
        seedCoupons();
    }

    private List<Category> seedCategories() {
        if (categoryRepository.count() > 0) {
            return categoryRepository.findAll();
        }
        List<Category> categories = List.of(
                cat("Áo thun", "Áo thun basic, áo thun in hình, áo thun cotton cao cấp"),
                cat("Áo sơ mi", "Áo sơ mi công sở, áo sơ mi form rộng, áo sơ mi caro"),
                cat("Quần jean", "Quần jean ống rộng, quần jean slim fit, quần jean skinny"),
                cat("Quần short", "Quần short kaki, quần short thể thao, quần short jean"),
                cat("Đầm", "Đầm dự tiệc, đầm công sở, đầm maxi dạo phố"),
                cat("Váy", "Váy chữ A, váy midi, váy mini, váy công sở"),
                cat("Áo khoác", "Áo khoác bomber, áo khoác denim, áo khoác gió")
        );
        return categoryRepository.saveAll(categories);
    }

    private void seedProducts(List<Category> categories) {
        if (productRepository.count() > 0) {
            return;
        }
        // categories[0] = Áo thun, [1] = Áo sơ mi, [2] = Quần jean, [3] = Quần short,
        // [4] = Đầm, [5] = Váy, [6] = Áo khoác
        List<Product> products = List.of(
                product("Áo Thun Basic Cotton", 199000d, 299000d, 150,
                        "S, M, L, XL", "Trắng, Đen, Xám", "100% Cotton",
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop",
                        "Áo thun basic chất liệu cotton 100%, mềm mịn, thấm hút mồ hôi tốt. Thiết kế đơn giản, phù hợp với nhiều phong cách. Màu sắc trung tính dễ phối đồ.",
                        categories.get(0)),
                product("Áo Sơ Mi Form Rộng", 350000d, 450000d, 80,
                        "S, M, L, XL, XXL", "Trắng, Xanh nhạt, Be", "Cotton Linen",
                        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop",
                        "Áo sơ mi dáng rộng, chất vải cotton linen nhẹ mát. Phong cách casual-chic phù hợp đi làm và đi chơi. Thiết kế tối giản, sang trọng.",
                        categories.get(1)),
                product("Quần Jean Ống Suông", 450000d, 590000d, 60,
                        "28, 29, 30, 31, 32", "Xanh đậm, Xanh nhạt", "Denim 98% Cotton",
                        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop",
                        "Quần jean ống suông cá tính, chất denim dày dặn bền đẹp. Kiểu dáng hiện đại, phù hợp với nhiều loại áo. Co giãn nhẹ thoải mái khi di chuyển.",
                        categories.get(2)),
                product("Quần Short Kaki", 280000d, 380000d, 100,
                        "S, M, L, XL", "Be, Nâu đất, Xanh rêu", "Cotton Kaki",
                        "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&h=750&fit=crop",
                        "Quần short kaki nam thời trang, chất vải kaki cao cấp không nhăn. Thiết kế đơn giản với 2 túi hộp tiện lợi. Phù hợp đi biển, đi chơi cuối tuần.",
                        categories.get(3)),
                product("Đầm Dự Tiệc Dáng Xòe", 850000d, 1200000d, 35,
                        "S, M, L", "Đỏ rượu, Đen, Xanh navy", "Voan Chiffon",
                        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=750&fit=crop",
                        "Đầm xòe sang trọng cho dự tiệc và sự kiện đặc biệt. Chất liệu voan chiffon nhẹ nhàng, thoáng mát. Đường may tinh tế, ôm dáng tuyệt đẹp.",
                        categories.get(4)),
                product("Váy Chữ A Công Sở", 420000d, 550000d, 70,
                        "S, M, L, XL", "Đen, Xanh navy, Xám", "Vải Tweed",
                        "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop",
                        "Váy chữ A thanh lịch, phù hợp với môi trường công sở. Chất vải tweed cao cấp, giữ form tốt. Dài qua gối, tinh tế và chuyên nghiệp.",
                        categories.get(5)),
                product("Áo Khoác Bomber", 680000d, 950000d, 45,
                        "M, L, XL, XXL", "Đen, Xanh olive, Nâu", "Nylon + Polyester",
                        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop",
                        "Áo khoác bomber phong cách, chất liệu nylon cao cấp chống gió. Thiết kế unisex phù hợp cả nam và nữ. Túi bên tiện lợi, cổ tay và gấu co giãn.",
                        categories.get(6)),
                product("Áo Croptop Nữ", 180000d, 250000d, 120,
                        "S, M, L", "Trắng, Đen, Hồng nude", "Cotton Rib",
                        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop",
                        "Áo croptop nữ chất liệu cotton rib ôm body nhẹ. Phong cách year2000 trendy, phù hợp phối với quần cao cạp. Thấm hút tốt, thoải mái khi vận động.",
                        categories.get(0))
        );
        productRepository.saveAll(products);
    }

    private void seedBanners() {
        if (bannerRepository.count() > 0) {
            return;
        }
        List<Banner> banners = List.of(
                banner("Bộ Sưu Tập Mùa Hè 2026", "Giảm giá đến 50% cho các sản phẩm mới",
                        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=500&fit=crop",
                        "/products", 1),
                banner("Ưu Đãi Thành Viên Mới", "Đăng ký ngay để nhận voucher 100.000đ",
                        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=500&fit=crop",
                        "/register", 2),
                banner("Hàng Mới Về Mỗi Tuần", "Cập nhật xu hướng thời trang mới nhất",
                        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=500&fit=crop",
                        "/products", 3)
        );
        bannerRepository.saveAll(banners);
    }

    private void seedPosts() {
        if (postRepository.count() > 0) {
            return;
        }
        List<Post> posts = List.of(
                post("Xu Hướng Thời Trang Hè 2026",
                        "Khám phá những xu hướng thời trang nổi bật nhất mùa hè năm nay, từ màu sắc đến kiểu dáng.",
                        "Mùa hè 2026 mang đến những làn sóng thời trang mới đầy màu sắc và sáng tạo. Năm nay, các nhà thiết kế tập trung vào sự kết hợp giữa phong cách tối giản và các họa tiết độc đáo.\n\n"
                                + "Màu sắc chủ đạo của mùa hè này là tông màu đất ấm áp như be, nâu caramel và xanh sage. Bên cạnh đó, màu trắng tinh khôi vẫn là lựa chọn không thể thiếu cho các ngày hè oi bức.\n\n"
                                + "Về kiểu dáng, các set đồ phối cùng tông màu (monochrome) đang là xu hướng được ưa chuộng nhất. Áo sơ mi form rộng kết hợp với quần short cargo tạo nên vẻ ngoài vừa cá tính vừa thoải mái.",
                        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop"),
                post("Bí Quyết Chọn Size Áo Phù Hợp",
                        "Hướng dẫn chi tiết cách đo kích thước và chọn size áo phù hợp với từng dáng người.",
                        "Chọn đúng size quần áo là bước quan trọng đầu tiên để có một tủ đồ hoàn hảo. Nhiều người thường gặp khó khăn trong việc xác định size phù hợp với mình.\n\n"
                                + "Cách đo kích thước cơ bản:\n- Vòng ngực: Đo phần đầy nhất của ngực\n- Vòng eo: Đo phần nhỏ nhất của eo\n- Vòng hông: Đo phần đầy nhất của hông\n- Chiều cao: Đo từ đỉnh đầu đến gót chân\n\n"
                                + "Dựa vào các số đo này, bạn có thể tra bảng size của chúng tôi để chọn được size phù hợp nhất. Fashion Store luôn cung cấp bảng size chi tiết cho từng sản phẩm.",
                        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&fit=crop")
        );
        postRepository.saveAll(posts);
    }

    private void seedAdmin() {
        if (customerRepository.findByEmail("admin@fashionstore.vn").isPresent()) {
            return;
        }
        Customer admin = new Customer();
        admin.setFullName("Quản Trị Viên");
        admin.setPhone("0900000000");
        admin.setEmail("admin@fashionstore.vn");
        // Mật khẩu: admin123 (đã mã hóa BCrypt)
        admin.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTvyV5LZQCC");
        admin.setAddress("Trụ sở Fashion Store");
        admin.setRole("ADMIN");
        customerRepository.save(admin);
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) {
            return;
        }
        List<Coupon> coupons = List.of(
                coupon("WELCOME10", "Giảm 10% cho đơn hàng đầu tiên", "PERCENT", 10d, 100000d, 200000d,
                        null, LocalDateTime.now().plusMonths(6), null),
                coupon("SALE50K", "Giảm ngay 50.000đ cho đơn từ 300.000đ", "FIXED", 50000d, null, 300000d,
                        null, LocalDateTime.now().plusMonths(3), 200),
                coupon("SUMMER2026", "Giảm 20% mùa hè, tối đa 150.000đ", "PERCENT", 20d, 150000d, 500000d,
                        null, LocalDateTime.now().plusMonths(2), 100)
        );
        couponRepository.saveAll(coupons);
    }

    private Coupon coupon(String code, String description, String discountType, Double discountValue,
                           Double maxDiscountAmount, Double minOrderAmount, LocalDateTime startDate,
                           LocalDateTime endDate, Integer usageLimit) {
        Coupon c = new Coupon();
        c.setCode(code);
        c.setDescription(description);
        c.setDiscountType(discountType);
        c.setDiscountValue(discountValue);
        c.setMaxDiscountAmount(maxDiscountAmount);
        c.setMinOrderAmount(minOrderAmount);
        c.setStartDate(startDate);
        c.setEndDate(endDate);
        c.setUsageLimit(usageLimit);
        c.setUsedCount(0);
        c.setActive(true);
        return c;
    }

    private void seedStaff() {
        if (customerRepository.findByEmail("staff@fashionstore.vn").isPresent()) {
            return;
        }
        Customer staff = new Customer();
        staff.setFullName("Nhân Viên Quản Trị");
        staff.setPhone("0900000001");
        staff.setEmail("staff@fashionstore.vn");
        // Mật khẩu: staff123 (mã hóa lúc khởi động bằng PasswordEncoder, không hardcode hash)
        staff.setPassword(passwordEncoder.encode("staff123"));
        staff.setAddress("Trụ sở Fashion Store");
        staff.setRole("STAFF");
        customerRepository.save(staff);
    }

    // ===== Helper factory methods =====

    private Category cat(String name, String description) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(description);
        return c;
    }

    private Product product(String name, Double price, Double oldPrice, Integer stock,
                             String size, String color, String material,
                             String imageUrl, String description, Category category) {
        Product p = new Product();
        p.setName(name);
        p.setPrice(price);
        p.setOldPrice(oldPrice);
        p.setStockQuantity(stock);
        p.setSize(size);
        p.setColor(color);
        p.setMaterial(material);
        p.setImageUrl(imageUrl);
        p.setDescription(description);
        p.setCategory(category);
        return p;
    }

    private Banner banner(String title, String subtitle, String imageUrl, String linkUrl, int order) {
        Banner b = new Banner();
        b.setTitle(title);
        b.setSubtitle(subtitle);
        b.setImageUrl(imageUrl);
        b.setLinkUrl(linkUrl);
        b.setDisplayOrder(order);
        b.setActive(true);
        return b;
    }

    private Post post(String title, String summary, String content, String imageUrl) {
        Post p = new Post();
        p.setTitle(title);
        p.setSummary(summary);
        p.setContent(content);
        p.setImageUrl(imageUrl);
        p.setAuthor("Fashion Store Team");
        p.setActive(true);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return p;
    }
}