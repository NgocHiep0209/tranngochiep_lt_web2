import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('authToken') || null;
  });

  const login = (userData, jwtToken) => {
    // Không lưu password vào localStorage
    const safeUser = {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      role: userData.role,
    };
    setCurrentUser(safeUser);
    setToken(jwtToken);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    localStorage.setItem('authToken', jwtToken);
  };

  // Cập nhật lại thông tin user trong context + localStorage sau khi sửa hồ sơ / đổi mật khẩu
  const updateCurrentUser = (userData) => {
    const safeUser = {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      role: userData.role,
    };
    setCurrentUser(safeUser);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    // Xóa cả key cũ nếu còn
    localStorage.removeItem('customer');
  };

  const isAdmin = () => currentUser?.role === 'ADMIN';
  const isStaff = () => currentUser?.role === 'STAFF';
  // Được vào khu vực /admin: cả ADMIN và STAFF (nhân viên quản trị)
  const canAccessAdminPanel = () => isAdmin() || isStaff();
  const isLoggedIn = () => !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout, updateCurrentUser, isAdmin, isStaff, canAccessAdminPanel, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
