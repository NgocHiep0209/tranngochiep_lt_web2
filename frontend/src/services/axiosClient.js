import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  // Không set sẵn Content-Type ở đây. Axios sẽ TỰ ĐỘNG:
  //  - set 'application/json' khi data là object thường (JSON.stringify)
  //  - set 'multipart/form-data; boundary=...' khi data là FormData (upload file)
  // Nếu ép cứng 'application/json' ở đây, mọi request upload ảnh (FormData) cũng
  // bị gửi đi với Content-Type: application/json -> backend không đọc được phần
  // multipart -> lỗi 500 "Đã có lỗi xảy ra ở server". Đây chính là nguyên nhân
  // gây lỗi "Failed to load resource: 500" khi thêm/sửa ảnh sản phẩm ở trang Admin.
});

// Request interceptor: tự động đính kèm JWT token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Các API mà khi lỗi 401 KHÔNG nên tự động đăng xuất người dùng
// (để component tự bắt lỗi và hiển thị thông báo phù hợp cho người dùng)
const SELF_HANDLED_401_PATHS = ['/customers/me', '/customers/me/password'];

// Response interceptor: xử lý lỗi toàn cục
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isSelfHandled = SELF_HANDLED_401_PATHS.some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && !isSelfHandled) {
      // Token hết hạn hoặc không hợp lệ → xóa và chuyển về trang đăng nhập phù hợp
      const wasOnAdminPage = window.location.pathname.startsWith('/admin');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('customer');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = wasOnAdminPage ? '/admin/login' : '/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
