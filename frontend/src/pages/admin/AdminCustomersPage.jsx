import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import AdminSidebar from '../../components/admin/AdminSidebar';

const PAGE_SIZE = 10;

function AdminCustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      setCustomers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thành viên "${name}"?`)) return;
    try {
      await customerService.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Xóa thất bại!');
    }
  };

  // Lọc theo từ khóa (họ tên / email / SĐT) và vai trò
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return customers.filter((c) => {
      const matchKeyword =
        !kw ||
        c.fullName?.toLowerCase().includes(kw) ||
        c.email?.toLowerCase().includes(kw) ||
        c.phone?.toLowerCase().includes(kw);
      const matchRole = !roleFilter || c.role === roleFilter;
      return matchKeyword && matchRole;
    });
  }, [customers, keyword, roleFilter]);

  useEffect(() => {
    setPage(0);
  }, [keyword, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Quản Lý Thành Viên</h1>
          <Link to="/admin/customers/create" className="btn btn-primary">
            + Thêm thành viên
          </Link>
        </div>

        <div className="admin-toolbar">
          <form onSubmit={(e) => e.preventDefault()} className="admin-search">
            <input
              type="text"
              placeholder="Tìm theo họ tên, email, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              className="status-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="USER">Thành viên</option>
              <option value="ADMIN">Admin</option>
            </select>
          </form>
          <span className="record-count">{filtered.length} thành viên</span>
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
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Vai trò</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                        Không tìm thấy thành viên nào
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c, index) => (
                      <tr key={c.id}>
                        <td>{page * PAGE_SIZE + index + 1}</td>
                        <td><strong>{c.fullName}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.phone || '-'}</td>
                        <td style={{ maxWidth: '200px', wordBreak: 'break-word' }}>{c.address || '-'}</td>
                        <td>
                          <span className={`stock-badge ${c.role === 'ADMIN' ? 'out-stock' : 'in-stock'}`}>
                            {c.role === 'ADMIN' ? 'Admin' : 'Thành viên'}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => navigate(`/admin/customers/edit/${c.id}`)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(c.id, c.fullName)}
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

export default AdminCustomersPage;
