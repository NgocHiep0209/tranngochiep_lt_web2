import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await productService.search(keyword.trim());
      } else {
        res = await productService.getAll();
      }
      setProducts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Xóa thất bại!');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Quản Lý Sản Phẩm</h1>
          <Link to="/admin/products/create" className="btn btn-primary">
            + Thêm sản phẩm
          </Link>
        </div>

        <div className="admin-toolbar">
          <form onSubmit={handleSearch} className="admin-search">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Tìm</button>
          </form>
          <span className="record-count">{products.length} sản phẩm</span>
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
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      Không có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={product.imageUrl || 'https://placehold.co/60x70/1a1a2e/ffffff?text=SP'}
                          alt={product.name}
                          className="admin-product-img"
                          onError={(e) => { e.target.src = 'https://placehold.co/60x70/1a1a2e/ffffff?text=SP'; }}
                        />
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                        {product.color && <br />}
                        {product.color && <small>Màu: {product.color} | Size: {product.size}</small>}
                      </td>
                      <td>{product.category?.name || '-'}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <span className={`stock-badge ${product.stockQuantity > 0 ? 'in-stock' : 'out-stock'}`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(product.id, product.name)}
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

export default AdminProductsPage;
