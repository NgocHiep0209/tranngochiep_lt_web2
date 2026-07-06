import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Xóa thất bại! Có thể danh mục này đang được sản phẩm sử dụng.');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Quản Lý Danh Mục</h1>
          <Link to="/admin/categories/create" className="btn btn-primary">
            + Thêm danh mục
          </Link>
        </div>

        <div className="admin-toolbar">
          <span className="record-count">{categories.length} danh mục</span>
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
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                      Chưa có danh mục nào
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{index + 1}</td>
                      <td><strong>{cat.name}</strong></td>
                      <td>{cat.description || '-'}</td>
                      <td className="action-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => navigate(`/admin/categories/edit/${cat.id}`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(cat.id, cat.name)}
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

export default AdminCategoriesPage;
