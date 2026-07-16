import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import couponService from '../../services/couponService';

function CheckoutPage() {
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useAuth();
  const customer = currentUser;

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

  // ===== Mã giảm giá =====
  const [couponInput, setCouponInput] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount, finalAmount }

  // Voucher đã nhận (ví voucher) - hiển thị lại khi bấm "Áp dụng"
  const [myVouchers, setMyVouchers] = useState([]);
  const [showVoucherPicker, setShowVoucherPicker] = useState(false);

  useEffect(() => {
    if (customer?.id) {
      couponService
        .getMyCoupons(customer.id)
        .then((list) => setMyVouchers(list.filter((v) => !v.used)))
        .catch(() => setMyVouchers([]));
    }
  }, [customer?.id]);

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

  const handleApplyCoupon = async (codeOverride) => {
    const codeToApply = (codeOverride ?? couponInput).trim();
    if (!codeToApply) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    setCouponChecking(true);
    setCouponError('');
    try {
      const res = await couponService.validate(codeToApply, getTotalPrice());
      setAppliedCoupon(res);
      setCouponInput(codeToApply);
      setShowVoucherPicker(false);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setCouponChecking(false);
    }
  };

  const handlePickVoucher = (voucher) => {
    handleApplyCoupon(voucher.code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
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
        couponCode: appliedCoupon ? appliedCoupon.code : null,
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

          {/* Nhập mã giảm giá */}
          <div className="checkout-coupon-box">
            <div className="checkout-coupon-label-row">
              <div className="checkout-coupon-label">🎟️ Mã giảm giá</div>
              {customer?.id && myVouchers.length > 0 && !appliedCoupon && (
                <button
                  type="button"
                  className="checkout-coupon-picker-toggle"
                  onClick={() => setShowVoucherPicker((v) => !v)}
                >
                  Voucher đã nhận ({myVouchers.length}) {showVoucherPicker ? '▲' : '▼'}
                </button>
              )}
            </div>

            {!appliedCoupon && showVoucherPicker && (
              <div className="checkout-voucher-picker">
                {myVouchers.map((v) => {
                  const notEnough = v.minOrderAmount && getTotalPrice() < v.minOrderAmount;
                  return (
                    <div key={v.couponId} className="checkout-voucher-picker-item">
                      <div>
                        <span className="checkout-voucher-picker-code">{v.code}</span>
                        <span className="checkout-voucher-picker-desc">{v.description}</span>
                        {notEnough && (
                          <span className="checkout-voucher-picker-warn">
                            Cần đơn tối thiểu {formatPrice(v.minOrderAmount)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: 13 }}
                        onClick={() => handlePickVoucher(v)}
                        disabled={couponChecking || notEnough}
                      >
                        Áp dụng
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!appliedCoupon ? (
              <>
                <div className="checkout-coupon-row">
                  <input
                    type="text"
                    placeholder="Nhập mã voucher..."
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                    className={`checkout-coupon-input ${couponError ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="btn btn-primary checkout-coupon-apply-btn"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponChecking}
                  >
                    {couponChecking ? 'Đang kiểm tra...' : 'Áp dụng'}
                  </button>
                </div>
                {couponError && <span className="error-msg checkout-coupon-error">{couponError}</span>}
              </>
            ) : (
              <div className="checkout-coupon-applied">
                <div className="checkout-coupon-applied-info">
                  <span className="checkout-coupon-applied-code">✅ {appliedCoupon.code}</span>
                  <span>Đã giảm {formatPrice(appliedCoupon.discountAmount)}</span>
                </div>
                <button type="button" className="checkout-coupon-remove-btn" onClick={handleRemoveCoupon}>
                  ✕ Gỡ mã
                </button>
              </div>
            )}
          </div>

          <div className="checkout-total">
            <span>Tạm tính:</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
          {appliedCoupon && (
            <div className="checkout-total">
              <span>Giảm giá:</span>
              <span style={{ color: '#10b981' }}>-{formatPrice(appliedCoupon.discountAmount)}</span>
            </div>
          )}
          <div className="checkout-total">
            <span>Tổng cộng:</span>
            <span className="total-price">
              {formatPrice(appliedCoupon ? appliedCoupon.finalAmount : getTotalPrice())}
            </span>
          </div>
        </div>

        {/* Checkout Form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          {/* Thông tin tài khoản đang đăng nhập (chỉ hiển thị, không chỉnh sửa ở đây) */}
          {isLoggedIn() ? (
            <div className="checkout-account-info">
              <h3>👤 Thông tin tài khoản</h3>
              <div className="checkout-account-row">
                <span className="checkout-account-label">Tên tài khoản</span>
                <span>{currentUser.fullName}</span>
              </div>
              <div className="checkout-account-row">
                <span className="checkout-account-label">Email</span>
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div className="checkout-account-row">
                  <span className="checkout-account-label">SĐT đã lưu</span>
                  <span>{currentUser.phone}</span>
                </div>
              )}
              <p className="checkout-account-note">
                Bạn có thể chỉnh sửa thông tin người nhận bên dưới nếu muốn giao đến địa chỉ khác.
              </p>
            </div>
          ) : (
            <div className="checkout-account-info checkout-account-guest">
              <h3>👤 Bạn đang đặt hàng với tư cách khách</h3>
              <p className="checkout-account-note">
                <Link to="/login">Đăng nhập</Link> để lưu thông tin và theo dõi đơn hàng dễ dàng hơn.
              </p>
            </div>
          )}

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
