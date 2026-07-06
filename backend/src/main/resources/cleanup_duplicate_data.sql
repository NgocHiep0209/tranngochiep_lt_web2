-- ============================================================
-- SCRIPT DỌN DỮ LIỆU TRÙNG LẶP
-- Chạy 1 LẦN DUY NHẤT trước khi khởi động lại backend với bản fix mới
-- (DataSeeder.java). Giữ lại bản ghi có id NHỎ NHẤT của mỗi nhóm trùng,
-- xóa các bản ghi trùng còn lại.
-- ============================================================

USE fashion_store;

-- ---- PRODUCTS: xóa sản phẩm trùng tên (nếu không ai đã đặt hàng chúng) ----
DELETE p1 FROM products p1
INNER JOIN products p2
    ON p1.name = p2.name AND p1.id > p2.id;

-- ---- CATEGORIES: xóa danh mục trùng tên ----
-- Trước khi xóa, cập nhật lại category_id của product đang trỏ tới category trùng
-- về category giữ lại (id nhỏ nhất) để không bị mất liên kết.
UPDATE products p
INNER JOIN categories c_dup ON p.category_id = c_dup.id
INNER JOIN (
    SELECT name, MIN(id) AS keep_id
    FROM categories
    GROUP BY name
) c_keep ON c_dup.name = c_keep.name
SET p.category_id = c_keep.keep_id
WHERE c_dup.id <> c_keep.keep_id;

DELETE c1 FROM categories c1
INNER JOIN categories c2
    ON c1.name = c2.name AND c1.id > c2.id;

-- ---- BANNERS: xóa banner trùng tiêu đề ----
DELETE b1 FROM banners b1
INNER JOIN banners b2
    ON b1.title = b2.title AND b1.id > b2.id;

-- ---- POSTS: xóa bài viết trùng tiêu đề ----
DELETE po1 FROM posts po1
INNER JOIN posts po2
    ON po1.title = po2.title AND po1.id > po2.id;

-- ---- Kiểm tra lại số lượng sau khi dọn ----
SELECT 'categories' AS table_name, COUNT(*) AS total FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'banners', COUNT(*) FROM banners
UNION ALL
SELECT 'posts', COUNT(*) FROM posts;