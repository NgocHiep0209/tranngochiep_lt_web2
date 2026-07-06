import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import customerService from '../../services/customerService';
import { useAuth } from '../../contexts/AuthContext';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, currentUser, isAdmin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nếu đã đăng nhập là admin thì redirect
  React.useEffect(() => {
    if (currentUser && isAdmin()) {
      navigate('/admin');
    }
  }, [currentUser, isAdmin, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email không hợp lệ';
    if (!form.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await customerService.login(form);
      if (res.role !== 'ADMIN') {
        setApiError('Tài khoản này không có quyền quản trị!');
        return;
      }
      login(res, res.token);
      navigate('/admin');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg"></div>
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="admin-login-icon">⚙️</span>
          <h1>Fashion Store</h1>
          <p className="admin-login-sub">Trang Quản Trị</p>
        </div>

        {apiError && <div className="alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Email quản trị</label>
            <div className="input-icon-wrap">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@fashionstore.vn"
                className={errors.email ? 'error' : ''}
                autoComplete="username"
              />
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'error' : ''}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-admin-login" disabled={loading}>
            {loading ? (
              <><span className="btn-spinner"></span> Đang đăng nhập...</>
            ) : (
              '🔐 Đăng nhập quản trị'
            )}
          </button>
        </form>

        <div className="admin-login-hint">
          <p>💡 Tài khoản mặc định:</p>
          <code>admin@fashionstore.vn / admin123</code>
        </div>

        <div className="admin-login-footer">
          <Link to="/" className="admin-back-link">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
