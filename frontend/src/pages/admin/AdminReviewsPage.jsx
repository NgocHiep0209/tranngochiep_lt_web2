import React, { useEffect, useMemo, useState } from 'react';
import reviewService from '../../services/reviewService';
import AdminSidebar from '../../components/admin/AdminSidebar';

const PAGE_SIZE = 10;

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  // null = đang xem danh sách sản phẩm; có giá trị = đang xem chi tiết đánh giá của 1 sản phẩm
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('');

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

  // Gom nhóm đánh giá theo sản phẩm: đếm số lượng + điểm trung bình,
  // sắp xếp sản phẩm nào được đánh giá nhiều nhất lên đầu.
  const productGroups = useMemo(() => {
    const map = new Map();
    reviews.forEach((r) => {
      const key = r.productId;
      if (!map.has(key)) {
        map.set(key, {
          productId: key,
          productName: r.productName || `#${key}`,
          reviews: [],
        });
      }
      map.get(key).reviews.push(r);
    });

    return Array.from(map.values())
      .map((g) => ({
        ...g,
        count: g.reviews.length,
        average: g.reviews.reduce((sum, r) => sum + r.rating, 0) / g.reviews.length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [reviews]);

  const filteredGroups = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return productGroups;
    return productGroups.filter((g) => g.productName.toLowerCase().includes(kw));
  }, [productGroups, keyword]);

  useEffect(() => {
    setPage(0);
  }, [keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const paginatedGroups = filteredGroups.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const selectedGroup = useMemo(
    () => productGroups.find((g) => g.productId === selectedProductId) || null,
    [productGroups, selectedProductId]
  );

  const selectedReviews = useMemo(() => {
    if (!selectedGroup) return [];
    if (!ratingFilter) return selectedGroup.reviews;
    return selectedGroup.reviews.filter((r) => String(r.rating) === ratingFilter);
  }, [selectedGroup, ratingFilter]);

  const renderStars = (n) => '⭐'.repeat(Math.round(n));

  // ===== Chi tiết đánh giá của 1 sản phẩm =====
  if (selectedGroup) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-page-header">
            <button
              className="btn btn-outline"
              onClick={() => { setSelectedProductId(null); setRatingFilter(''); }}
              style={{ marginBottom: 12 }}
            >
              ← Quay lại danh sách sản phẩm
            </button>
            <h1>{selectedGroup.productName}</h1>
            <p style={{ color: '#888', margin: 0 }}>
              {renderStars(selectedGroup.average)} {selectedGroup.average.toFixed(1)}/5
              &nbsp;·&nbsp; {selectedGroup.count} đánh giá
            </p>
          </div>

          <div className="admin-toolbar">
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
            <span className="record-count">{selectedReviews.length} đánh giá</span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>Số sao</th>
                  <th>Nội dung</th>
                  <th>Ngày đánh giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {selectedReviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      Không có đánh giá nào
                    </td>
                  </tr>
                ) : (
                  selectedReviews.map((r, index) => (
                    <tr key={r.id}>
                      <td>{index + 1}</td>
                      <td><strong>{r.customerName}</strong></td>
                      <td>{'⭐'.repeat(r.rating)}</td>
                      <td style={{ maxWidth: '360px', wordBreak: 'break-word' }}>
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
        </main>
      </div>
    );
  }

  // ===== Danh sách sản phẩm theo số lượt đánh giá =====
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Quản Lý Đánh Giá</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Danh sách sản phẩm theo số lượt đánh giá - bấm vào 1 sản phẩm để xem tất cả đánh giá
          </p>
        </div>

        <div className="admin-toolbar">
          <form onSubmit={(e) => e.preventDefault()} className="admin-search">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </form>
          <span className="record-count">{filteredGroups.length} sản phẩm được đánh giá</span>
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
                    <th>Số lượt đánh giá</th>
                    <th>Điểm trung bình</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGroups.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                        Không có sản phẩm nào được đánh giá
                      </td>
                    </tr>
                  ) : (
                    paginatedGroups.map((g, index) => (
                      <tr
                        key={g.productId}
                        onClick={() => setSelectedProductId(g.productId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{page * PAGE_SIZE + index + 1}</td>
                        <td><strong>{g.productName}</strong></td>
                        <td>{g.count}</td>
                        <td>{renderStars(g.average)} {g.average.toFixed(1)}</td>
                        <td className="action-cell">
                          <button
                            className="btn-action"
                            onClick={(e) => { e.stopPropagation(); setSelectedProductId(g.productId); }}
                          >
                            👁️ Xem đánh giá
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
