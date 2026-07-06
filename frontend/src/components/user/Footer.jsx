import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>✦ Fashion Store</h3>
          <p>Thời trang hiện đại – Phong cách riêng của bạn.</p>
        </div>
        <div className="footer-links">
          <h4>Điều hướng</h4>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/cart">Giỏ hàng</Link></li>
            <li><Link to="/login">Đăng nhập</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Liên hệ</h4>
          <p>📍 123 Đường Thời Trang, TP.HCM</p>
          <p>📞 0123 456 789</p>
          <p>✉️ info@fashionstore.vn</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Fashion Store. Bản quyền thuộc về Fashion Store.</p>
      </div>
    </footer>
  );
}

export default Footer;
