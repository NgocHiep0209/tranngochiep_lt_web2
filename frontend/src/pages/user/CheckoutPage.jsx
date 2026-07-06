import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import orderService from '../../services/orderService';

function CheckoutPage() {
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem('customer') || 'null');

  const [form, setForm] = useState({
    customerName: customer?.fullName || '',
    customerPhone: customer?.phone || '',
    customerAddress: customer?.address || '',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Vui lòng nhập họ tên';
    if (!form.customerPhone.trim()) newErrors.customerPhone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(form.customerPhone.trim()))
      newErrors.customerPhone = 'Số điện thoại không hợp lệ';
    if (!form.customerAddress.trim()) newErrors.customerAddress = 'Vui lòng nhập địa chỉ';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setApiError('');
    setLoading(true);
    try {
      const orderData = {
        customerId: customer?.id || null,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        note: form.note,
        orderDetails: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      await orderService.create(orderData);
      setSuccess(true);
      clearCart();

      setTimeout(() => {
        navigate('/products');
      }, 3000);
    } catch (err) {
      // Backend trả lỗi rõ ràng khi hết hàng (409), sản phẩm không tồn tại (404),
      // hoặc dữ liệu không hợp lệ (400) - hiển thị đúng message đó cho người dùng.
      const message = err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      setApiError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h2>Đặt hàng thành công!</h2>
          <p>Cảm ơn bạn đã mua sắm tại Fashion Store.</p>
          <p>Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
          <p style={{ color: '#999', fontSize: '14px' }}>Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-hero">
        <h1>Thanh Toán</h1>
      </div>

      <div className="checkout-layout">
        {/* Order Summary */}
        <div className="checkout-summary">
          <h3>Đơn hàng của bạn</h3>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <img
                  src={item.imageUrl || 'https://placehold.co/60x80/1a1a2e/ffffff?text=SP'}
                  alt={item.name}
                  onError={(e) => { e.target.src = 'https://placehold.co/60x80/1a1a2e/ffffff?text=SP'; }}
                />
                <div className="checkout-item-info">
                  <p className="checkout-item-name">{item.name}</p>
                  <p className="checkout-item-qty">Số lượng: {item.quantity}</p>
                </div>
                <span className="checkout-item-price">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Tổng cộng:</span>
            <span className="total-price">{formatPrice(getTotalPrice())}</span>
          </div>
        </div>

        {/* Checkout Form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Thông tin giao hàng</h3>

          {apiError && <div className="alert-error">{apiError}</div>}

          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className={errors.customerName ? 'error' : ''}
            />
            {errors.customerName && <span className="error-msg">{errors.customerName}</span>}
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="text"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className={errors.customerPhone ? 'error' : ''}
            />
            {errors.customerPhone && <span className="error-msg">{errors.customerPhone}</span>}
          </div>

          <div className="form-group">
            <label>Địa chỉ giao hàng *</label>
            <textarea
              name="customerAddress"
              value={form.customerAddress}
              onChange={handleChange}
              placeholder="Nhập địa chỉ giao hàng đầy đủ"
              rows={3}
              className={errors.customerAddress ? 'error' : ''}
            />
            {errors.customerAddress && <span className="error-msg">{errors.customerAddress}</span>}
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              rows={2}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang xử lý...' : '🛒 Đặt hàng ngay'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
