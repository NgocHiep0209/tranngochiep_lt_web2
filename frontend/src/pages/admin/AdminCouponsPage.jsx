import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import couponService from '../../services/couponService';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminCouponsPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponService.getAll();
      setCoupons(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}"?`)) return;
    try {
      await couponService.delete(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const formatDate = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '-');

  const describeDiscount = (c) =>
    c.discountType === 'PERCENT'
      ? `${c.discountValue}%${c.maxDiscountAmount ? ` (tối đa ${formatPrice(c.maxDiscountAmount)})` : ''}`
      : formatPrice(c.discountValue);

  const isExpired = (c) => c.endDate && new Date(c.endDate) < new Date();
  const isUsedUp = (c) => c.usageLimit != null && (c.usedCount || 0) >= c.usageLimit;

  const statusOf = (c) => {
    if (!c.active) return { label: 'Vô hiệu hóa', className: 'status-cancelled' };
    if (isExpired(c)) return { label: 'Hết hạn', className: 'status-cancelled' };
    if (isUsedUp(c)) return { label: 'Hết lượt', className: 'status-cancelled' };
    return { label: 'Đang hoạt động', className: 'status-completed' };
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>🎟️ Quản Lý Mã Giảm Giá</h1>
          <Link to="/admin/coupons/create" className="btn btn-primary">
            + Thêm mã giảm giá
          </Link>
        </div>

        <div className="admin-toolbar">
          <span className="record-count">{coupons.length} mã giảm giá</span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Giảm giá</th>
                  <th>Đơn tối thiểu</th>
                  <th>Hạn dùng</th>
                  <th>Lượt dùng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                      Chưa có mã giảm giá nào
                    </td>
                  </tr>
                ) : (
                  coupons.map((c, index) => {
                    const status = statusOf(c);
                    return (
                      <tr key={c.id}>
                        <td>{index + 1}</td>
                        <td><strong>{c.code}</strong></td>
                        <td>{c.description || '-'}</td>
                        <td>{describeDiscount(c)}</td>
                        <td>{c.minOrderAmount ? formatPrice(c.minOrderAmount) : '-'}</td>
                        <td>{formatDate(c.endDate)}</td>
                        <td>{c.usedCount || 0}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
                        <td>
                          <span className={`status-badge ${status.className}`}>{status.label}</span>
                        </td>
                        <td className="action-cell">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => navigate(`/admin/coupons/edit/${c.id}`)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(c.id, c.code)}
                          >
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminCouponsPage;
