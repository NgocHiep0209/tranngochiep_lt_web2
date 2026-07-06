import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import AdminSidebar from '../../components/admin/AdminSidebar';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  role: 'USER',
};

function AdminCustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      customerService.getById(id)
        .then((c) => {
          setForm({
            fullName: c.fullName || '',
            email: c.email || '',
            phone: c.phone || '',
            address: c.address || '',
            password: '',
            role: c.role || 'USER',
          });
        })
        .catch(() => navigate('/admin/customers'))
        .finally(() => setLoadingData(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email không hợp lệ';
    if (!isEdit && !form.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (form.password && form.password.length < 6)
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
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
    const payload = { ...form };
    if (isEdit && !payload.password) {
      delete payload.password; // giữ nguyên mật khẩu cũ nếu để trống
    }

    try {
      if (isEdit) {
        await customerService.update(id, payload);
        alert('Cập nhật thành viên thành công!');
      } else {
        await customerService.create(payload);
        alert('Thêm thành viên thành công!');
      }
      navigate('/admin/customers');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>{isEdit ? '✏️ Chỉnh sửa thành viên' : '➕ Thêm thành viên mới'}</h1>
          <button className="btn btn-outline" onClick={() => navigate('/admin/customers')}>
            ← Quay lại
          </button>
        </div>

        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="09xxxxxxxx"
                />
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="USER">Thành viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>{isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-msg">{errors.password}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Đang lưu...' : (isEdit ? '💾 Cập nhật' : '➕ Thêm thành viên')}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/admin/customers')}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminCustomerFormPage;
