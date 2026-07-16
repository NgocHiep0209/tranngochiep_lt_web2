import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './admin/AdminSidebar';

/**
 * Dùng để bọc các trang admin CHỈ dành cho ADMIN (không cho STAFF vào),
 * ví dụ: Quản lý thành viên, Mã giảm giá. Khác với AdminRoute (cho cả
 * ADMIN lẫn STAFF vào khu vực /admin nói chung).
 *
 * Không dùng Navigate redirect ở đây vì người dùng đã ở đúng khu vực /admin
 * hợp lệ (đã qua AdminRoute) - chỉ là không đủ quyền cho TRANG này, nên hiển thị
 * thông báo rõ ràng thay vì âm thầm đá về trang khác.
 */
function AdminOnlyRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-no-permission">
            <span className="admin-no-permission-icon">🔒</span>
            <h2>Bạn không có quyền truy cập trang này</h2>
            <p>Chỉ tài khoản <strong>Admin</strong> mới có thể truy cập chức năng này.</p>
          </div>
        </main>
      </div>
    );
  }

  return children;
}

export default AdminOnlyRoute;
