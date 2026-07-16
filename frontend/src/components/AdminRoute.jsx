import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Bảo vệ route admin: cho ADMIN và STAFF (nhân viên quản trị) vào
// Nếu chưa đăng nhập → redirect về /admin/login
// Nếu đã đăng nhập nhưng không phải ADMIN/STAFF (VD: khách hàng USER) → redirect về /
function AdminRoute({ children }) {
  const { currentUser, canAccessAdminPanel } = useAuth();

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!canAccessAdminPanel()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;