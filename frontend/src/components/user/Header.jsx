import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import VoucherCenterModal from './VoucherCenterModal';

function Header() {
  const { getTotalItems } = useCart();
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-icon">✦</span> Fashion Store
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Sản phẩm</Link>
          <Link to="/posts" onClick={() => setMenuOpen(false)}>Bài viết</Link>
          <button
            type="button"
            className="nav-voucher-btn"
            onClick={() => { setVoucherModalOpen(true); setMenuOpen(false); }}
          >
            🎟️ Voucher
          </button>
          <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
            Giỏ hàng
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </Link>

          {currentUser ? (
            <>
              {currentUser && (
                <>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)}>❤️ Yêu thích</Link>
                </>
              )}
              <Link to="/profile" className="nav-user" onClick={() => setMenuOpen(false)}>
                👤 {currentUser.fullName}
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="nav-admin" onClick={() => setMenuOpen(false)}>
                  ⚙️ Admin
                </Link>
              )}
              <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
      {voucherModalOpen && <VoucherCenterModal onClose={() => setVoucherModalOpen(false)} />}
    </header>
  );
}

export default Header;
