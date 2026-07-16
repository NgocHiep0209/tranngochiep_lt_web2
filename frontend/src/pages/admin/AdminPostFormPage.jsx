import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import postService from '../../services/postService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import uploadService from '../../services/uploadService';

const initialForm = {
  title: '',
  summary: '',
  content: '',
  imageUrl: '',
  author: '',
  active: true,
};

function AdminPostFormPage() {
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
      postService.getById(id)
        .then((p) => {
          setForm({
            title: p.title || '',
            summary: p.summary || '',
            content: p.content || '',
            imageUrl: p.imageUrl || '',
            author: p.author || '',
            active: p.active ?? true,
          });
        })
        .catch(() => navigate('/admin/posts'))
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
    if (!form.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
    if (!form.content.trim()) newErrors.content = 'Vui lòng nhập nội dung bài viết';
    return newErrors;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.url }));
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
    try {
      if (isEdit) {
        await postService.update(id, form);
        alert('Cập nhật bài viết thành công!');
      } else {
        await postService.create(form);
        alert('Thêm bài viết thành công!');
      }
      navigate('/admin/posts');
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
          <h1>{isEdit ? '✏️ Chỉnh sửa bài viết' : '➕ Thêm bài viết mới'}</h1>
          <button className="btn btn-outline" onClick={() => navigate('/admin/posts')}>
            ← Quay lại
          </button>
        </div>

        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Tiêu đề bài viết *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề bài viết"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label>Tác giả</label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Tên tác giả"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tóm tắt (hiển thị ở danh sách)</label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="Mô tả ngắn về bài viết (1-2 câu)..."
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Ảnh đại diện</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span> Đang tải ảnh lên...</span>}
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Hoặc dán link ảnh trực tiếp"
                style={{ marginTop: 8 }}
              />
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
              <label>Nội dung bài viết *</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Nhập nội dung đầy đủ của bài viết..."
                rows={12}
                className={errors.content ? 'error' : ''}
                style={{ fontFamily: 'monospace', lineHeight: '1.6' }}
              />
              {errors.content && <span className="error-msg">{errors.content}</span>}
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
                Hiển thị bài viết này trên website
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || uploading}>
                {uploading ? 'Đang tải ảnh lên...' : loading ? 'Đang lưu...' : (isEdit ? '💾 Cập nhật' : '➕ Thêm bài viết')}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/admin/posts')}
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

export default AdminPostFormPage;
