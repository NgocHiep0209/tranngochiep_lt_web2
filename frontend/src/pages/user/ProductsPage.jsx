import React, { useEffect, useState, useRef } from 'react';
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

  // Lọc theo khoảng giá & sắp xếp nâng cao
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) setSelectedCategory(catFromUrl);
  }, [searchParams]);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  // Mỗi khi đổi bộ lọc/sắp xếp thì quay về trang đầu, sau đó mới gọi API
  // (gộp chung 1 effect để tránh gọi API 2 lần - 1 lần với trang cũ sai, 1 lần đúng)
  const prevFiltersRef = useRef({ selectedCategory, keyword, priceRange, sortOption });

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.selectedCategory !== selectedCategory ||
      prev.keyword !== keyword ||
      prev.priceRange !== priceRange ||
      prev.sortOption !== sortOption;
    prevFiltersRef.current = { selectedCategory, keyword, priceRange, sortOption };

    if (filtersChanged && page !== 0) {
      setPage(0);
      return; // effect sẽ tự chạy lại khi page về 0, không fetch ở đây để tránh gọi API thừa
    }

    setLoading(true);
    productService
      .getPaged({
        page,
        size: PAGE_SIZE,
        categoryId: selectedCategory || undefined,
        keyword: keyword.trim() || undefined,
        minPrice: priceRange.min || undefined,
        maxPrice: priceRange.max || undefined,
        sort: sortOption,
      })
      .then((res) => {
        setProducts(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch((err) => console.error('Lỗi tải sản phẩm:', err))
      .finally(() => setLoading(false));
  }, [page, selectedCategory, keyword, priceRange, sortOption]);

  const handleSearch = (e) => e.preventDefault();

  const handleApplyPriceRange = (e) => {
    e.preventDefault();
    const min = minPriceInput.trim();
    const max = maxPriceInput.trim();
    if (min && max && Number(min) > Number(max)) {
      alert('Giá tối thiểu không được lớn hơn giá tối đa');
      return;
    }
    setPriceRange({ min, max });
  };

  const handlePricePreset = (min, max) => {
    setMinPriceInput(min === undefined ? '' : String(min));
    setMaxPriceInput(max === undefined ? '' : String(max));
    setPriceRange({ min: min === undefined ? '' : String(min), max: max === undefined ? '' : String(max) });
  };

  const hasActiveFilters = selectedCategory || keyword || priceRange.min || priceRange.max || sortOption !== 'newest';

  const handleClearFilters = () => {
    setSelectedCategory('');
    setKeyword('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setPriceRange({ min: '', max: '' });
    setSortOption('newest');
  };

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

          <div className="filter-block">
            <h3 className="filter-title">💰 Khoảng giá</h3>
            <form onSubmit={handleApplyPriceRange} className="search-form">
              <div className="price-range-inputs">
                <input
                  type="number"
                  min="0"
                  placeholder="Từ (đ)"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
                <span className="price-range-sep">—</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Đến (đ)"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Áp dụng
              </button>
            </form>
            <div className="price-range-presets">
              <button className="filter-btn" onClick={() => handlePricePreset(undefined, 200000)}>
                Dưới 200.000đ
              </button>
              <button className="filter-btn" onClick={() => handlePricePreset(200000, 500000)}>
                200.000đ - 500.000đ
              </button>
              <button className="filter-btn" onClick={() => handlePricePreset(500000, 1000000)}>
                500.000đ - 1.000.000đ
              </button>
              <button className="filter-btn" onClick={() => handlePricePreset(1000000, undefined)}>
                Trên 1.000.000đ
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <button className="filter-clear-btn" onClick={handleClearFilters}>
              ✕ Xóa tất cả bộ lọc
            </button>
          )}
        </aside>

        <main className="products-main">
          <div className="products-header">
            <p className="products-count">
              {loading ? 'Đang tải...' : `${totalElements} sản phẩm`}
            </p>
            <div className="products-sort">
              <label htmlFor="sort-select">Sắp xếp:</label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="bestselling">Bán chạy nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
              </select>
            </div>
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