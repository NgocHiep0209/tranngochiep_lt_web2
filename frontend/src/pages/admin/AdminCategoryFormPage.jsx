import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import AdminSidebar from '../../components/admin/AdminSidebar';

const initialForm = { name: '', description: '' };

function AdminCategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      categoryService.getById(id)
        .then((c) => setForm({ name: c.name || '', description: c.description || '' }))
        .catch(() => navigate('/admin/categories'))
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
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập tên danh mục';
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
      if (isEdit) {
        await categoryService.update(id, form);
        alert('Cập nhật danh mục thành công!');
      } else {
        await categoryService.create(form);
        alert('Thêm danh mục thành công!');
      }
      navigate('/admin/categories');
    } catch (err) {
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
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
          <h1>{isEdit ? '✏️ Chỉnh sửa danh mục' : '➕ Thêm danh mục mới'}</h1>
          <button className="btn btn-outline" onClick={() => navigate('/admin/categories')}>
            ← Quay lại
          </button>
        </div>

        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên danh mục *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ví dụ: Áo thun"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn về danh mục..."
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Đang lưu...' : (isEdit ? '💾 Cập nhật' : '➕ Thêm danh mục')}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/admin/categories')}
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

export default AdminCategoryFormPage;
