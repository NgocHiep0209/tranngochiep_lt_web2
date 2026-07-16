import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bannerService from '../../services/bannerService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import uploadService from '../../services/uploadService';

const initialForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  displayOrder: 0,
  active: true,
};

function AdminBannerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      bannerService.getById(id)
        .then((b) => {
          setForm({
            title: b.title || '',
            subtitle: b.subtitle || '',
            imageUrl: b.imageUrl || '',
            linkUrl: b.linkUrl || '',
            displayOrder: b.displayOrder ?? 0,
            active: b.active ?? true,
          });
        })
        .catch(() => navigate('/admin/banners'))
        .finally(() => setLoadingData(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề banner';
    if (!form.imageUrl.trim()) newErrors.imageUrl = 'Vui lòng nhập link ảnh banner';
    return newErrors;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.url }));
      setErrors((prev) => ({ ...prev, imageUrl: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Upload ảnh thất bại!');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      alert('Ảnh đang được tải lên, vui lòng đợi upload xong rồi mới lưu.');
      return;
    }
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const payload = { ...form, displayOrder: Number(form.displayOrder) || 0 };

    try {
      if (isEdit) {
        await bannerService.update(id, payload);
        alert('Cập nhật banner thành công!');
      } else {
        await bannerService.create(payload);
        alert('Thêm banner thành công!');
      }
      navigate('/admin/banners');
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
          <h1>{isEdit ? '✏️ Chỉnh sửa banner' : '➕ Thêm banner mới'}</h1>
          <button className="btn btn-outline" onClick={() => navigate('/admin/banners')}>
            ← Quay lại
          </button>
        </div>

        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Bộ sưu tập mùa hè"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label>Phụ đề</label>
                <input
                  type="text"
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="Ví dụ: Giảm giá đến 50%"
                />
              </div>

              <div className="form-group">
                <label>Link khi bấm vào banner</label>
                <input
                  type="text"
                  name="linkUrl"
                  value={form.linkUrl}
                  onChange={handleChange}
                  placeholder="/products hoặc /products?category=1"
                />
              </div>

              <div className="form-group">
                <label>Thứ tự hiển thị</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={form.displayOrder}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ảnh banner *</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span> Đang tải ảnh lên...</span>}
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Hoặc dán link ảnh trực tiếp"
                className={errors.imageUrl ? 'error' : ''}
                style={{ marginTop: 8 }}
              />
              {errors.imageUrl && <span className="error-msg">{errors.imageUrl}</span>}
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="img-preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                Hiển thị banner này trên trang chủ
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || uploading}>
                {uploading ? 'Đang tải ảnh lên...' : loading ? 'Đang lưu...' : (isEdit ? '💾 Cập nhật' : '➕ Thêm banner')}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/admin/banners')}
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

export default AdminBannerFormPage;
