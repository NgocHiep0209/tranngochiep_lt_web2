import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import couponService from '../../services/couponService';
import AdminSidebar from '../../components/admin/AdminSidebar';

const initialForm = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  active: true,
};

// datetime-local input cần chuỗi "YYYY-MM-DDTHH:mm" (không giây, không timezone)
const toDatetimeLocal = (isoString) => (isoString ? isoString.slice(0, 16) : '');

function AdminCouponFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isEdit) {
      couponService.getById(id)
        .then((c) => setForm({
          code: c.code || '',
          description: c.description || '',
          discountType: c.discountType || 'PERCENT',
          discountValue: c.discountValue ?? '',
          maxDiscountAmount: c.maxDiscountAmount ?? '',
          minOrderAmount: c.minOrderAmount ?? '',
          startDate: toDatetimeLocal(c.startDate),
          endDate: toDatetimeLocal(c.endDate),
          usageLimit: c.usageLimit ?? '',
          active: c.active !== false,
        }))
        .catch(() => navigate('/admin/coupons'))
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
    if (!form.code.trim()) newErrors.code = 'Vui lòng nhập mã giảm giá';
    if (!form.discountValue || Number(form.discountValue) <= 0)
      newErrors.discountValue = 'Giá trị giảm giá phải lớn hơn 0';
    if (form.discountType === 'PERCENT' && Number(form.discountValue) > 100)
      newErrors.discountValue = 'Giảm theo % không được vượt quá 100';
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate))
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description || null,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      active: form.active,
    };

    setApiError('');
    setLoading(true);
    try {
      if (isEdit) {
        await couponService.update(id, payload);
        alert('Cập nhật mã giảm giá thành công!');
      } else {
        await couponService.create(payload);
        alert('Thêm mã giảm giá thành công!');
      }
      navigate('/admin/coupons');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
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
          <h1>{isEdit ? '✏️ Chỉnh sửa mã giảm giá' : '➕ Thêm mã giảm giá mới'}</h1>
          <button className="btn btn-outline" onClick={() => navigate('/admin/coupons')}>
            ← Quay lại
          </button>
        </div>

        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            {apiError && <div className="alert-error">{apiError}</div>}

            <div className="form-group">
              <label>Mã giảm giá *</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Ví dụ: SALE50"
                className={errors.code ? 'error' : ''}
                disabled={isEdit}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && <span className="error-msg">{errors.code}</span>}
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Ví dụ: Giảm giá mừng khai trương"
                rows={2}
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Loại giảm giá *</label>
                <select name="discountType" value={form.discountType} onChange={handleChange}>
                  <option value="PERCENT">Theo phần trăm (%)</option>
                  <option value="FIXED">Số tiền cố định (VNĐ)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>
                  Giá trị giảm * {form.discountType === 'PERCENT' ? '(%)' : '(VNĐ)'}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={handleChange}
                  placeholder={form.discountType === 'PERCENT' ? 'Ví dụ: 20' : 'Ví dụ: 50000'}
                  className={errors.discountValue ? 'error' : ''}
                  min="0"
                />
                {errors.discountValue && <span className="error-msg">{errors.discountValue}</span>}
              </div>
            </div>

            {form.discountType === 'PERCENT' && (
              <div className="form-group">
                <label>Giảm tối đa (VNĐ, để trống nếu không giới hạn)</label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={form.maxDiscountAmount}
                  onChange={handleChange}
                  placeholder="Ví dụ: 100000"
                  min="0"
                />
              </div>
            )}

            <div className="form-group">
              <label>Giá trị đơn hàng tối thiểu (VNĐ, để trống nếu không yêu cầu)</label>
              <input
                type="number"
                name="minOrderAmount"
                value={form.minOrderAmount}
                onChange={handleChange}
                placeholder="Ví dụ: 200000"
                min="0"
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Ngày bắt đầu</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Ngày hết hạn</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'error' : ''}
                />
                {errors.endDate && <span className="error-msg">{errors.endDate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Số lượt sử dụng tối đa (để trống nếu không giới hạn)</label>
              <input
                type="number"
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="Ví dụ: 100"
                min="1"
              />
            </div>

            <div className="form-group form-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />
                {' '}Kích hoạt mã giảm giá này
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Đang lưu...' : (isEdit ? '💾 Cập nhật' : '➕ Thêm mã giảm giá')}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/admin/coupons')}
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

export default AdminCouponFormPage;
