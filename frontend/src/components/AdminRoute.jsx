import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Bảo vệ route admin: chỉ cho ADMIN vào
// Nếu chưa đăng nhập → redirect về /admin/login
// Nếu đã đăng nhập nhưng không phải ADMIN → redirect về /
function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;