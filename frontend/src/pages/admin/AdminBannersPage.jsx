import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bannerService from '../../services/bannerService';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminBannersPage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await bannerService.getAll();
      setBanners(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa banner "${title}"?`)) return;
    try {
      await bannerService.delete(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert('Xóa thất bại!');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const updated = await bannerService.update(banner.id, { ...banner, active: !banner.active });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    } catch (err) {
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Quản Lý Banner</h1>
          <Link to="/admin/banners/create" className="btn btn-primary">
            + Thêm banner
          </Link>
        </div>

        <div className="admin-toolbar">
          <span className="record-count">{banners.length} banner</span>
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
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      Chưa có banner nào
                    </td>
                  </tr>
                ) : (
                  banners.map((banner, index) => (
                    <tr key={banner.id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={banner.imageUrl || 'https://placehold.co/100x50/1a1a2e/ffffff?text=Banner'}
                          alt={banner.title}
                          className="admin-product-img"
                          style={{ width: '90px', height: '50px' }}
                          onError={(e) => { e.target.src = 'https://placehold.co/100x50/1a1a2e/ffffff?text=Banner'; }}
                        />
                      </td>
                      <td>
                        <strong>{banner.title}</strong>
                        {banner.subtitle && <><br /><small>{banner.subtitle}</small></>}
                      </td>
                      <td>{banner.displayOrder}</td>
                      <td>
                        <span
                          className={`stock-badge ${banner.active ? 'in-stock' : 'out-stock'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleActive(banner)}
                          title="Bấm để bật/tắt hiển thị"
                        >
                          {banner.active ? 'Đang hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => navigate(`/admin/banners/edit/${banner.id}`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(banner.id, banner.title)}
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminBannersPage;
