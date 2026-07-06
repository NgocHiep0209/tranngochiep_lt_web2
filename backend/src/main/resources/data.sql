-- ============================================
-- FASHION STORE - Dữ liệu mẫu
-- Chạy sau khi backend đã khởi động (auto-tạo bảng)
-- ============================================

USE fashion_store;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (name, description) VALUES
('Áo thun', 'Áo thun basic, áo thun in hình, áo thun cotton cao cấp'),
('Áo sơ mi', 'Áo sơ mi công sở, áo sơ mi form rộng, áo sơ mi caro'),
('Quần jean', 'Quần jean ống rộng, quần jean slim fit, quần jean skinny'),
('Quần short', 'Quần short kaki, quần short thể thao, quần short jean'),
('Đầm', 'Đầm dự tiệc, đầm công sở, đầm maxi dạo phố'),
('Váy', 'Váy chữ A, váy midi, váy mini, váy công sở'),
('Áo khoác', 'Áo khoác bomber, áo khoác denim, áo khoác gió')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (name, price, old_price, stock_quantity, size, color, material, image_url, description, category_id)
VALUES
(
  'Áo Thun Basic Cotton',
  199000, 299000, 150,
  'S, M, L, XL',
  'Trắng, Đen, Xám',
  '100% Cotton',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop',
  'Áo thun basic chất liệu cotton 100%, mềm mịn, thấm hút mồ hôi tốt. Thiết kế đơn giản, phù hợp với nhiều phong cách. Màu sắc trung tính dễ phối đồ.',
  1
),
(
  'Áo Sơ Mi Form Rộng',
  350000, 450000, 80,
  'S, M, L, XL, XXL',
  'Trắng, Xanh nhạt, Be',
  'Cotton Linen',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop',
  'Áo sơ mi dáng rộng, chất vải cotton linen nhẹ mát. Phong cách casual-chic phù hợp đi làm và đi chơi. Thiết kế tối giản, sang trọng.',
  2
),
(
  'Quần Jean Ống Suông',
  450000, 590000, 60,
  '28, 29, 30, 31, 32',
  'Xanh đậm, Xanh nhạt',
  'Denim 98% Cotton',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop',
  'Quần jean ống suông cá tính, chất denim dày dặn bền đẹp. Kiểu dáng hiện đại, phù hợp với nhiều loại áo. Co giãn nhẹ thoải mái khi di chuyển.',
  3
),
(
  'Quần Short Kaki',
  280000, 380000, 100,
  'S, M, L, XL',
  'Be, Nâu đất, Xanh rêu',
  'Cotton Kaki',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&h=750&fit=crop',
  'Quần short kaki nam thời trang, chất vải kaki cao cấp không nhăn. Thiết kế đơn giản với 2 túi hộp tiện lợi. Phù hợp đi biển, đi chơi cuối tuần.',
  4
),
(
  'Đầm Dự Tiệc Dáng Xòe',
  850000, 1200000, 35,
  'S, M, L',
  'Đỏ rượu, Đen, Xanh navy',
  'Voan Chiffon',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=750&fit=crop',
  'Đầm xòe sang trọng cho dự tiệc và sự kiện đặc biệt. Chất liệu voan chiffon nhẹ nhàng, thoáng mát. Đường may tinh tế, ôm dáng tuyệt đẹp.',
  5
),
(
  'Váy Chữ A Công Sở',
  420000, 550000, 70,
  'S, M, L, XL',
  'Đen, Xanh navy, Xám',
  'Vải Tweed',
  'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop',
  'Váy chữ A thanh lịch, phù hợp với môi trường công sở. Chất vải tweed cao cấp, giữ form tốt. Dài qua gối, tinh tế và chuyên nghiệp.',
  6
),
(
  'Áo Khoác Bomber',
  680000, 950000, 45,
  'M, L, XL, XXL',
  'Đen, Xanh olive, Nâu',
  'Nylon + Polyester',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop',
  'Áo khoác bomber phong cách, chất liệu nylon cao cấp chống gió. Thiết kế unisex phù hợp cả nam và nữ. Túi bên tiện lợi, cổ tay và gấu co giãn.',
  7
),
(
  'Áo Croptop Nữ',
  180000, 250000, 120,
  'S, M, L',
  'Trắng, Đen, Hồng nude',
  'Cotton Rib',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop',
  'Áo croptop nữ chất liệu cotton rib ôm body nhẹ. Phong cách year2000 trendy, phù hợp phối với quần cao cạp. Thấm hút tốt, thoải mái khi vận động.',
  1
)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- BANNERS (trang chủ)
-- ============================================
INSERT INTO banners (title, subtitle, image_url, link_url, display_order, active) VALUES
('Bộ Sưu Tập Mùa Hè 2026', 'Giảm giá đến 50% cho các sản phẩm mới', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=500&fit=crop', '/products', 1, true),
('Ưu Đãi Thành Viên Mới', 'Đăng ký ngay để nhận voucher 100.000đ', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=500&fit=crop', '/register', 2, true),
('Hàng Mới Về Mỗi Tuần', 'Cập nhật xu hướng thời trang mới nhất', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=500&fit=crop', '/products', 3, true)
ON DUPLICATE KEY UPDATE title=title;

-- ============================================
-- BÀI VIẾT MẪU
-- ============================================
INSERT INTO posts (title, summary, content, image_url, author, active, created_at, updated_at) VALUES
(
  'Xu Hướng Thời Trang Hè 2026',
  'Khám phá những xu hướng thời trang nổi bật nhất mùa hè năm nay, từ màu sắc đến kiểu dáng.',
  'Mùa hè 2026 mang đến những làn sóng thời trang mới đầy màu sắc và sáng tạo. Năm nay, các nhà thiết kế tập trung vào sự kết hợp giữa phong cách tối giản và các họa tiết độc đáo.\n\nMàu sắc chủ đạo của mùa hè này là tông màu đất ấm áp như be, nâu caramel và xanh sage. Bên cạnh đó, màu trắng tinh khôi vẫn là lựa chọn không thể thiếu cho các ngày hè oi bức.\n\nVề kiểu dáng, các set đồ phối cùng tông màu (monochrome) đang là xu hướng được ưa chuộng nhất. Áo sơ mi form rộng kết hợp với quần short cargo tạo nên vẻ ngoài vừa cá tính vừa thoải mái.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
  'Fashion Store Team',
  true,
  NOW(),
  NOW()
),
(
  'Bí Quyết Chọn Size Áo Phù Hợp',
  'Hướng dẫn chi tiết cách đo kích thước và chọn size áo phù hợp với từng dáng người.',
  'Chọn đúng size quần áo là bước quan trọng đầu tiên để có một tủ đồ hoàn hảo. Nhiều người thường gặp khó khăn trong việc xác định size phù hợp với mình.\n\nCách đo kích thước cơ bản:\n- Vòng ngực: Đo phần đầy nhất của ngực\n- Vòng eo: Đo phần nhỏ nhất của eo\n- Vòng hông: Đo phần đầy nhất của hông\n- Chiều cao: Đo từ đỉnh đầu đến gót chân\n\nDựa vào các số đo này, bạn có thể tra bảng size của chúng tôi để chọn được size phù hợp nhất. Fashion Store luôn cung cấp bảng size chi tiết cho từng sản phẩm.',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&fit=crop',
  'Fashion Store Team',
  true,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE title=title;

-- ============================================
-- TÀI KHOẢN ADMIN MẶC ĐỊNH
-- Email: admin@fashionstore.vn / Mật khẩu: admin123
-- Mật khẩu đã được mã hóa bằng BCrypt
-- ============================================
INSERT INTO customers (full_name, phone, email, password, address, role) VALUES
('Quản Trị Viên', '0900000000', 'admin@fashionstore.vn',
 '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTvyV5LZQCC',
 'Trụ sở Fashion Store', 'ADMIN')
ON DUPLICATE KEY UPDATE email=email;

-- ============================================
-- THÔNG BÁO
-- ============================================
SELECT 'Dữ liệu mẫu đã được thêm thành công!' AS message;
SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_banners FROM banners;
SELECT COUNT(*) AS total_posts FROM posts;
