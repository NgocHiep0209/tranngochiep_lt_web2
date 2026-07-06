import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="page-hero">
          <h1>Giỏ Hàng</h1>
        </div>
        <div className="empty-cart">
          <span className="empty-cart-icon">🛒</span>
          <h3>Giỏ hàng của bạn đang trống</h3>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Link to="/products" className="btn btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-hero">
        <h1>Giỏ Hàng</h1>
        <p>{cartItems.length} sản phẩm trong giỏ</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-table-header">
            <span>Sản phẩm</span>
            <span>Đơn giá</span>
            <span>Số lượng</span>
            <span>Thành tiền</span>
            <span></span>
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-product">
                <img
                  src={item.imageUrl || 'https://placehold.co/80x100/1a1a2e/ffffff?text=SP'}
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/80x100/1a1a2e/ffffff?text=SP';
                  }}
                />
                <div>
                  <p className="cart-item-name">{item.name}</p>
                  {item.size && <p className="cart-item-meta">Size: {item.size}</p>}
                  {item.color && <p className="cart-item-meta">Màu: {item.color}</p>}
                </div>
              </div>

              <span className="cart-item-price">{formatPrice(item.price)}</span>

              <div className="quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >−</button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >+</button>
              </div>

              <span className="cart-item-subtotal">
                {formatPrice(item.price * item.quantity)}
              </span>

              <button
                className="cart-remove-btn"
                onClick={() => removeFromCart(item.id)}
                title="Xóa sản phẩm"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span className="free-ship">Miễn phí</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total-row">
            <span>Tổng cộng:</span>
            <span className="total-price">{formatPrice(getTotalPrice())}</span>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate('/checkout')}
          >
            Thanh toán ngay →
          </button>
          <Link to="/products" className="btn btn-outline btn-block" style={{ marginTop: '10px' }}>
            ← Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
