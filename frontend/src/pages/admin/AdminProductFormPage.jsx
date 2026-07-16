import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import uploadService from '../../services/uploadService';
const initialForm = {
  name: '',
  price: '',
  oldPrice: '',
  stockQuantity: '',
  size: '',
  color: '',
  material: '',
  imageUrl: '',
  description: '',
  category: { id: '' },
};

function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    categoryService.getAll()
      .then((res) => setCategories(res))
      .catch((err) => console.error(err));

    if (isEdit) {
      productService.getById(id)
        .then((p) => {
          setForm({
            name: p.name || '',
            price: p.price || '',
            oldPrice: p.oldPrice || '',
            stockQuantity: p.stockQuantity || '',
            size: p.size || '',
            color: p.color || '',
            material: p.material || '',
            imageUrl: p.imageUrl || '',
            description: p.description || '',
            category: { id: p.category?.id || '' },
          });
        })
        .catch(() => navigate('/admin/products'))
        .finally(() => setLoadingData(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoryId') {
      setForm((prev) => ({ ...prev, category: { id: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.price || isNaN(Number(form.price))) newErrors.price = 'Vui lòng nhập giá hợp lệ';
    if (!form.stockQuantity || isNaN(Number(form.stockQuantity)))
      newErrors.stockQuantity = 'Vui lòng nhập số lượng hợp lệ';
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
    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stockQuantity: Number(form.stockQuantity),
      category: form.category.id ? { id: Number(form.category.id) } : null,
    };

    try {
      if (isEdit) {
        await productService.update(id, payload);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productService.create(payload);
        alert('Thêm sản phẩm thành công!');
      }
      navigate('/admin/products');
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
          <h1>{isEdit ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</h1>
          <button className="btn btn-outline" onClick={() => navigate('/admin/products')}>
            ← Quay lại
          </button>
        </div>

        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nhập tên sản phẩm"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Danh mục</label>
                <select name="categoryId" value={form.category.id} onChange={handleChange}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Giá bán (VNĐ) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Ví dụ: 299000"
                  min="0"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <span className="error-msg">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>Giá cũ (VNĐ)</label>
                <input
                  type="number"
                  name="oldPrice"
                  value={form.oldPrice}
                  onChange={handleChange}
                  placeholder="Ví dụ: 399000"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Số lượng tồn kho *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  placeholder="Ví dụ: 50"
                  min="0"
                  className={errors.stockQuantity ? 'error' : ''}
                />
                {errors.stockQuantity && <span className="error-msg">{errors.stockQuantity}</span>}
              </div>

              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  placeholder="S, M, L, XL, XXL"
                />
              </div>

              <div className="form-group">
                <label>Màu sắc</label>
                <input
                  type="text"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="Trắng, Đen, Xanh..."
                />
              </div>

              <div className="form-group">
                <label>Chất liệu</label>
                <input
                  type="text"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  placeholder="Cotton, Polyester, Denim..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ảnh sản phẩm</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span> Đang tải ảnh lên...</span>}
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
              <label>Mô tả sản phẩm</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết sản phẩm..."
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || uploading}>
                {uploading ? 'Đang tải ảnh lên...' : loading ? 'Đang lưu...' : (isEdit ? '💾 Cập nhật' : '➕ Thêm sản phẩm')}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/admin/products')}
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

export default AdminProductFormPage;
