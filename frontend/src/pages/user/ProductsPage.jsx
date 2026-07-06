import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import ProductCard from '../../components/user/ProductCard';

const PAGE_SIZE = 12;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) setSelectedCategory(catFromUrl);
  }, [searchParams]);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  // Mỗi khi đổi danh mục/từ khóa thì quay về trang đầu
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, keyword]);

  useEffect(() => {
    setLoading(true);
    productService
      .getPaged({
        page,
        size: PAGE_SIZE,
        categoryId: selectedCategory || undefined,
        keyword: keyword.trim() || undefined,
      })
      .then((res) => {
        setProducts(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch((err) => console.error('Lỗi tải sản phẩm:', err))
      .finally(() => setLoading(false));
  }, [page, selectedCategory, keyword]);

  const handleSearch = (e) => e.preventDefault();

  return (
    <div className="products-page">
      <div className="page-hero">
        <h1>Sản Phẩm</h1>
        <p>Khám phá bộ sưu tập thời trang của chúng tôi</p>
      </div>

      <div className="products-layout">
        <aside className="filter-sidebar">
          <div className="filter-block">
            <h3 className="filter-title">🔍 Tìm kiếm</h3>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Tên sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Tìm kiếm
              </button>
            </form>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">📂 Danh mục</h3>
            <div className="category-filter-list">
              <button
                className={`filter-btn ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(''); setKeyword(''); }}
              >
                Tất cả sản phẩm
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${selectedCategory === String(cat.id) ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(String(cat.id)); setKeyword(''); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="products-main">
          <div className="products-header">
            <p className="products-count">
              {loading ? 'Đang tải...' : `${totalElements} sản phẩm`}
            </p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span>🛍️</span>
              <p>Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                  <button
                    className="btn btn-outline"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Trước
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`btn ${i === page ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
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
    </div>
  );
}

export default ProductsPage;