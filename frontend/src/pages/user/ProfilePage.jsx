import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';

const STATUS_LABELS = {
  pending: { text: 'Chờ xác nhận', color: '#f0ad4e' },
  confirmed: { text: 'Đã xác nhận', color: '#5bc0de' },
  shipping: { text: 'Đang giao', color: '#337ab7' },
  completed: { text: 'Hoàn thành', color: '#5cb85c' },
  cancelled: { text: 'Đã hủy', color: '#d9534f' },
};

function ProfilePage() {
  const { currentUser, isLoggedIn, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // ===== Chỉnh sửa thông tin cá nhân =====
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', address: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // ===== Đổi mật khẩu =====
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn()) return;
    orderService.getMyOrders()
      .then(setOrders)
      .catch((err) => console.error(err))
      .finally(() => setOrdersLoading(false));
  }, []);

  const startEditing = () => {
    setProfileForm({
      fullName: currentUser.fullName || '',
      phone: currentUser.phone || '',
      address: currentUser.address || '',
    });
    setProfileErrors({});
    setProfileMessage('');
    setEditing(true);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileErrors({ ...profileErrors, [e.target.name]: '' });
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileForm.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
    if (profileForm.phone && !/^[0-9]{9,11}$/.test(profileForm.phone.trim()))
      errs.phone = 'Số điện thoại không hợp lệ';
    return errs;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }
    setProfileSaving(true);
    setProfileMessage('');
    try {
      const updated = await customerService.updateMe(profileForm);
      updateCurrentUser(updated);
      setEditing(false);
      setProfileMessage('✅ Cập nhật thông tin thành công!');
    } catch (err) {
      if (err.response?.status === 401) {
        setProfileMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại rồi thử lại.');
      } else {
        setProfileMessage(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordForm.currentPassword) errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6)
      errs.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự';
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    return errs;
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage('');
    try {
      await customerService.changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage('✅ Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setPasswordMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại rồi thử lại.');
      } else {
        setPasswordMessage(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!currentUser) return null;

  const recentOrders = orders.slice(0, 3);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <h1>👤 Tài khoản của tôi</h1>

      <div className="admin-form-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%', background: '#1a1a2e',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, flexShrink: 0,
            }}
          >
            {currentUser.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{currentUser.fullName}</h2>
            <span style={{ color: '#888', fontSize: 14 }}>
              {currentUser.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
        </div>

        {profileMessage && !editing && (
          <p style={{ color: profileMessage.startsWith('✅') ? '#2e7d32' : '#d9534f', marginBottom: 12 }}>
            {profileMessage}
          </p>
        )}

        {!editing ? (
          <>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="spec-row">
                <span className="spec-label">📧 Email:</span>
                <span className="spec-value">{currentUser.email}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">📱 Điện thoại:</span>
                <span className="spec-value">{currentUser.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">🏠 Địa chỉ:</span>
                <span className="spec-value">{currentUser.address || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={startEditing}>✏️ Chỉnh sửa thông tin</button>
              <button
                className="btn btn-outline"
                onClick={() => { setChangingPassword(!changingPassword); setPasswordMessage(''); }}
              >
                🔒 Đổi mật khẩu
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 12 }}>
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                value={profileForm.fullName}
                onChange={handleProfileChange}
                className={profileErrors.fullName ? 'error' : ''}
              />
              {profileErrors.fullName && <span className="error-msg">{profileErrors.fullName}</span>}
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className={profileErrors.phone ? 'error' : ''}
              />
              {profileErrors.phone && <span className="error-msg">{profileErrors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <textarea
                name="address"
                value={profileForm.address}
                onChange={handleProfileChange}
                rows={3}
              />
            </div>
            {profileMessage && (
              <p style={{ color: profileMessage.startsWith('✅') ? '#2e7d32' : '#d9534f' }}>
                {profileMessage}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                {profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                Hủy
              </button>
            </div>
          </form>
        )}

        {changingPassword && (
          <form onSubmit={handleSavePassword} style={{ display: 'grid', gap: 12, marginTop: 20, borderTop: '1px solid #eee', paddingTop: 20 }}>
            <h3 style={{ margin: 0 }}>🔒 Đổi mật khẩu</h3>
            <div className="form-group">
              <label>Mật khẩu hiện tại *</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.currentPassword ? 'error' : ''}
              />
              {passwordErrors.currentPassword && <span className="error-msg">{passwordErrors.currentPassword}</span>}
            </div>
            <div className="form-group">
              <label>Mật khẩu mới *</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.newPassword ? 'error' : ''}
              />
              {passwordErrors.newPassword && <span className="error-msg">{passwordErrors.newPassword}</span>}
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.confirmPassword ? 'error' : ''}
              />
              {passwordErrors.confirmPassword && <span className="error-msg">{passwordErrors.confirmPassword}</span>}
            </div>
            {passwordMessage && (
              <p style={{ color: passwordMessage.startsWith('✅') ? '#2e7d32' : '#d9534f' }}>
                {passwordMessage}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                {passwordSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setChangingPassword(false)}>
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="admin-form-card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>📦 Đơn hàng của tôi</h2>
          <Link to="/my-orders" className="section-link">Xem tất cả →</Link>
        </div>

        {ordersLoading ? (
          <p style={{ color: '#888' }}>Đang tải đơn hàng...</p>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state">
            <span>🛍️</span>
            <p>Bạn chưa có đơn hàng nào</p>
            <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {recentOrders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || { text: order.status, color: '#999' };
              return (
                <Link
                  key={order.id}
                  to={`/my-orders/${order.id}`}
                  className="spec-row"
                  style={{ textDecoration: 'none', color: 'inherit', alignItems: 'center' }}
                >
                  <span className="spec-label">
                    Đơn #{order.id} · {formatDate(order.orderDate)}
                  </span>
                  <span className="spec-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: statusInfo.color, color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                      {statusInfo.text}
                    </span>
                    <strong>{formatPrice(order.totalAmount)}</strong>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <Link to="/my-orders" className="btn btn-outline">📦 Đơn hàng của tôi</Link>
        <Link to="/wishlist" className="btn btn-outline">❤️ Sản phẩm yêu thích</Link>
      </div>
    </div>
  );
}

export default ProfilePage;
