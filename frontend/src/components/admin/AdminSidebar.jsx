import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await chatService.getConversations();
        const total = res.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setChatUnread(total);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 8000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { to: '/admin', icon: '📊', label: 'Tổng quan', exact: true },
    { to: '/admin/products', icon: '📦', label: 'Quản lý sản phẩm' },
    { to: '/admin/categories', icon: '🗂️', label: 'Quản lý danh mục' },
    { to: '/admin/banners', icon: '🖼️', label: 'Quản lý banner' },
    { to: '/admin/posts', icon: '📝', label: 'Quản lý bài viết' },
    { to: '/admin/customers', icon: '👥', label: 'Quản lý thành viên', adminOnly: true },
    { to: '/admin/orders', icon: '🛒', label: 'Quản lý đơn hàng' },
    { to: '/admin/coupons', icon: '🎟️', label: 'Mã giảm giá', adminOnly: true },
    { to: '/admin/reviews', icon: '⭐', label: 'Quản lý đánh giá' },
    { to: '/admin/chat', icon: '💬', label: 'Chat với khách hàng', badge: chatUnread },
  ].filter((link) => !link.adminOnly || isAdmin());

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <span>⚙️</span>
        <div>
          <h3>Admin Panel</h3>
          {currentUser && (
            <>
              <p className="admin-sidebar-user">{currentUser.fullName}</p>
              <span className={`admin-role-badge ${isAdmin() ? 'admin-role-admin' : 'admin-role-staff'}`}>
                {isAdmin() ? 'Admin' : 'Nhân viên'}
              </span>
            </>
          )}
        </div>
      </div>
      <nav className="admin-nav">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`admin-nav-link ${isActive(link) ? 'active' : ''}`}
          >
            <span>{link.icon}</span> {link.label}
            {!!link.badge && <span className="chat-badge admin-nav-badge">{link.badge}</span>}
          </Link>
        ))}
        <div className="admin-nav-divider" />
        <Link to="/" className="admin-nav-link">
          <span>🏠</span> Về trang chủ
        </Link>
        <button className="admin-nav-link admin-logout-btn" onClick={handleLogout}>
          <span>🚪</span> Đăng xuất
        </button>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
