# Fashion Store — Website bán hàng online

Dự án gồm 2 phần độc lập, chạy riêng và giao tiếp qua REST API:

```
fashion-store/
├── backend/     # Spring Boot (Java 21) — REST API
└── frontend/    # React + Vite — giao diện người dùng
```

## 1. Backend (Spring Boot)

**Công nghệ:** Spring Boot, Spring Data JPA, MySQL, Lombok, Bean Validation.

**Cấu trúc package** (`com.example.fashionstore`):
- `entity/` — Product, Category, Customer (có field `role`: USER/ADMIN), Banner, Order, OrderDetail
- `repository/` — Spring Data JPA repositories
- `service/` — nghiệp vụ (Product, Category, Customer, Banner, Order)
- `controller/` — REST endpoint (`/api/...`)
- `dto/` — request/response object (LoginRequest, OrderRequest, OrderDetailRequest)
- `config/` — CorsConfig (cho phép frontend `http://localhost:5173` gọi API)

### Cấu hình trước khi chạy

Mở `backend/src/main/resources/application.properties`, chỉnh username/password MySQL cho đúng máy bạn:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fashion_store?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=       # <-- điền mật khẩu MySQL của bạn
```

MySQL cần được cài và chạy sẵn (database `fashion_store` sẽ tự tạo nhờ `createDatabaseIfNotExist=true`). File `data.sql` sẽ tự chạy để tạo dữ liệu mẫu.

### Chạy backend

```bash
cd backend
./mvnw spring-boot:run
```

Mặc định chạy ở `http://localhost:8080`.

## 2. Frontend (React + Vite)

**Cấu trúc:** tách rõ khu vực **Admin** và **User** thành 2 thư mục riêng biệt trong `components/` và `pages/` để dễ quản lý:

```
src/
├── components/
│   ├── admin/    # AdminSidebar
│   └── user/     # Header, Footer, ProductCard
├── pages/
│   ├── admin/    # AdminProductsPage, AdminProductFormPage,
│   │              AdminCategoriesPage, AdminCategoryFormPage,
│   │              AdminCustomersPage, AdminCustomerFormPage,
│   │              AdminBannersPage, AdminBannerFormPage,
│   │              AdminOrdersPage
│   └── user/     # HomePage, ProductsPage, ProductDetailPage,
│                   CartPage, CheckoutPage, LoginPage, RegisterPage
├── contexts/     # CartContext (giỏ hàng, dùng React Context API)
└── services/     # axiosClient, productService, categoryService,
                    customerService, bannerService, orderService
```

**Công nghệ:** React 18, React Router, Axios, Vite.

### Khu vực Admin (`/admin/...`)

Đăng nhập bằng tài khoản có `role = ADMIN` sẽ tự động chuyển vào `/admin/products`. Từ `AdminSidebar` có thể vào đủ 4 chức năng thêm/sửa/xóa:

| Chức năng | Danh sách | Thêm | Sửa |
|---|---|---|---|
| Sản phẩm | `/admin/products` | `/admin/products/create` | `/admin/products/edit/:id` |
| Danh mục | `/admin/categories` | `/admin/categories/create` | `/admin/categories/edit/:id` |
| Thành viên | `/admin/customers` | `/admin/customers/create` | `/admin/customers/edit/:id` |
| Banner | `/admin/banners` | `/admin/banners/create` | `/admin/banners/edit/:id` |
| Đơn hàng | `/admin/orders` | — (chỉ cập nhật trạng thái) | — |

Banner đang bật (`active = true`) sẽ tự hiển thị thành carousel ở đầu trang chủ (`HomePage`).

**Tài khoản admin mặc định** (tạo sẵn trong `data.sql`):
- Email: `admin@fashionstore.vn`
- Mật khẩu: `admin123`

### Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Mặc định chạy ở `http://localhost:5173` (đã khớp với CORS đã cấu hình ở backend).

## 3. Thứ tự chạy dự án

1. Bật MySQL, tạo/kiểm tra config trong `application.properties`.
2. `cd backend && ./mvnw spring-boot:run` (chạy API ở cổng 8080).
3. `cd frontend && npm install && npm run dev` (chạy giao diện ở cổng 5173).
4. Mở trình duyệt: `http://localhost:5173`.

## Cập nhật nghiệp vụ (đã bổ sung)

- **Trừ tồn kho khi đặt hàng**: `POST /api/orders` kiểm tra tồn kho từng sản phẩm, trừ ngay trong transaction; nếu không đủ hàng sẽ trả lỗi 409 kèm tên sản phẩm và số lượng còn lại, không tạo đơn.
- **Hoàn tồn kho khi huỷ đơn**: chuyển trạng thái đơn sang `cancelled` sẽ tự cộng lại số lượng đã trừ.
- **Giá lấy từ server, không tin client**: `unitPrice` khi tạo đơn được lấy từ giá sản phẩm hiện tại trong DB, tránh trường hợp sửa giá ở trình duyệt rồi gửi lên.
- **Validate dữ liệu đầu vào** bằng Bean Validation (`@NotBlank`, `@Email`, `@Min`, `@PositiveOrZero`...) trên entity/DTO, tự động áp dụng nhờ `@Valid` ở controller.
- **Chuẩn hoá lỗi API** bằng `GlobalExceptionHandler` — mọi lỗi (404/400/409/500) trả về cùng 1 format JSON:
  ```json
  { "timestamp": "...", "status": 400, "error": "Bad Request", "message": "...", "path": "/api/orders", "fieldErrors": { "customerName": "..." } }
  ```
- Trạng thái đơn hàng hợp lệ: `pending`, `confirmed`, `shipping`, `completed`, `cancelled` — gửi trạng thái khác sẽ bị từ chối (400).

⚠️ **Còn lại (chưa làm, để làm ở bước bảo mật sau)**: mật khẩu vẫn đang lưu dạng plaintext, API login/register vẫn trả về field `password` trong response, và trang/API admin chưa có xác thực/phân quyền thực sự ở tầng backend (Spring Security) — hiện chỉ tách biệt về mặt giao diện (frontend), người dùng gõ thẳng URL `/admin/...` hoặc gọi thẳng API `POST/PUT/DELETE` vẫn không bị chặn. Nếu triển khai thật cần bổ sung Spring Security + JWT và kiểm tra `role == ADMIN` ở backend cho các endpoint quản trị.

## Ghi chú dọn dẹp cấu trúc

So với bản zip gốc, mình đã:
- Bỏ project Spring Boot rỗng dư thừa ở thư mục gốc (chỉ có file khởi tạo mặc định, không có code thật).
- Gộp code thật của backend (`backend-fashion-store`) và frontend (`frontend-fashion-store`) vào 2 thư mục `backend/` và `frontend/` ngang hàng, dễ nhìn, đúng chuẩn một repo full-stack.
- Loại bỏ `target/` (build output Java) và `node_modules/` (thư viện cài qua npm) ra khỏi file nộp/nén — các thư mục này sẽ tự sinh lại khi build/`npm install`, không nên đóng gói hay commit vào git.
