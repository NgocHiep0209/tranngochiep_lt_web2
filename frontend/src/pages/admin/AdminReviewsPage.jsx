import React, { useEffect, useMemo, useState } from 'react';
import reviewService from '../../services/reviewService';
import AdminSidebar from '../../components/admin/AdminSidebar';

const PAGE_SIZE = 10;

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAll();
      setReviews(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này? Hành động không thể hoàn tác.')) return;
    try {
      await reviewService.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Xóa thất bại!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  // Lọc theo từ khóa (tên khách hàng / tên sản phẩm / nội dung) và số sao
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchKeyword =
        !kw ||
        r.customerName?.toLowerCase().includes(kw) ||
        r.productName?.toLowerCase().includes(kw) ||
        r.comment?.toLowerCase().includes(kw);
      const matchRating = !ratingFilter || String(r.rating) === ratingFilter;
      return matchKeyword && matchRating;
    });
  }, [reviews, keyword, ratingFilter]);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setPage(0);
  }, [keyword, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Quản Lý Đánh Giá</h1>
        </div>

        <div className="admin-toolbar">
          <form onSubmit={(e) => e.preventDefault()} className="admin-search">
            <input
              type="text"
              placeholder="Tìm theo khách hàng, sản phẩm, nội dung..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              className="status-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="">Tất cả sao</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>{star} sao</option>
              ))}
            </select>
          </form>
          <span className="record-count">{filtered.length} đánh giá</span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Khách hàng</th>
                    <th>Số sao</th>
                    <th>Nội dung</th>
                    <th>Ngày đánh giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                        Không có đánh giá nào
                      </td>
                    </tr>
                  ) : (
                    paginated.map((r, index) => (
                      <tr key={r.id}>
                        <td>{page * PAGE_SIZE + index + 1}</td>
                        <td>{r.productName || `#${r.productId}`}</td>
                        <td><strong>{r.customerName}</strong></td>
                        <td>{'⭐'.repeat(r.rating)}</td>
                        <td style={{ maxWidth: '280px', wordBreak: 'break-word' }}>
                          {r.comment || <span style={{ color: '#999' }}>(không có nội dung)</span>}
                        </td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td className="action-cell">
                          <button className="btn-action btn-delete" onClick={() => handleDelete(r.id)}>
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
                <button
                  className="btn btn-outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Trước
                </button>
                <span style={{ padding: '0 8px' }}>Trang {page + 1} / {totalPages}</span>
                <button
                  className="btn btn-outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminReviewsPage;
