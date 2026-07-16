import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import bannerService from '../../services/bannerService';
import wishlistService from '../../services/wishlistService';
import ProductCard from '../../components/user/ProductCard';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [mostFavorited, setMostFavorited] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, bannerRes, favRes] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
          bannerService.getActive().catch(() => []),
          wishlistService.getMostFavorited(8).catch(() => []),
        ]);
        setProducts(prodRes);
        setCategories(catRes);
        setBanners(bannerRes || []);
        setMostFavorited(favRes || []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const newProducts = products.slice(0, 4);
  const featuredProducts = products.slice(4, 8);

  const categoryIcons = ['👕', '👔', '👖', '🩳', '👗', '👗', '🧥', '👚'];

  return (
    <div className="home-page">
      {/* Banner Carousel (quan ly tu Admin) */}
      {banners.length > 0 && (
        <section className="banner-carousel">
          {banners.map((banner, index) => (
            <Link
              key={banner.id}
              to={banner.linkUrl || '/products'}
              className={'banner-slide ' + (index === activeSlide ? 'active' : '')}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                onError={(e) => { e.target.src = 'https://placehold.co/1200x500/1a1a2e/ffffff?text=Banner'; }}
              />
              <div className="banner-slide-content">
                <h2>{banner.title}</h2>
                {banner.subtitle && <p>{banner.subtitle}</p>}
              </div>
            </Link>
          ))}
          {banners.length > 1 && (
            <div className="banner-dots">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  className={'banner-dot ' + (index === activeSlide ? 'active' : '')}
                  onClick={() => setActiveSlide(index)}
                  aria-label={'Xem banner ' + (index + 1)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <p className="hero-subtitle">BỘ SƯU TẬP MỚI 2024</p>
          <h1 className="hero-title">
            Thời Trang<br />
            <span className="hero-accent">Định Nghĩa Bạn</span>
          </h1>
          <p className="hero-desc">
            Khám phá hàng ngàn sản phẩm thời trang cao cấp, phong cách hiện đại
            với giá cả hợp lý nhất.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-hero-primary">
              Mua sắm ngay
            </Link>
            <Link to="/products" className="btn btn-hero-outline">
              Xem bộ sưu tập
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-badge">NEW</div>
          <div className="hero-circle"></div>
          <div className="hero-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=600&fit=crop"
              alt="Fashion Banner"
              onError={(e) => {
                e.target.src = 'https://placehold.co/500x600/1a1a2e/ffffff?text=Fashion';
              }}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Sản phẩm</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Khách hàng</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Thương hiệu</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.9★</span>
            <span className="stat-label">Đánh giá</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section categories-section">
          <div className="section-header">
            <h2 className="section-title">Danh Mục Nổi Bật</h2>
            <p className="section-subtitle">Khám phá các danh mục thời trang đa dạng</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-card"
              >
                <span className="category-icon">{categoryIcons[index] || '👗'}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      <section className="section products-section">
        <div className="section-header">
          <h2 className="section-title">Sản Phẩm Mới</h2>
          <Link to="/products" className="section-link">Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : (
          <div className="products-grid">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <p className="promo-tag">ƯU ĐÃI ĐẶC BIỆT</p>
          <h2>Giảm đến <span>50%</span> cho đơn hàng đầu tiên</h2>
          <p>Đăng ký thành viên ngay để nhận ưu đãi độc quyền</p>
          <Link to="/register" className="btn btn-promo">Đăng ký ngay</Link>
        </div>
      </section>

      {/* Best Sellers */}
      {featuredProducts.length > 0 && (
        <section className="section products-section">
          <div className="section-header">
            <h2 className="section-title">Sản Phẩm Bán Chạy</h2>
            <Link to="/products" className="section-link">Xem tất cả →</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Most Favorited Products - dựa trên số lượt yêu thích thực tế */}
      {mostFavorited.length > 0 && (
        <section className="section products-section">
          <div className="section-header">
            <h2 className="section-title">❤️ Sản Phẩm Được Yêu Thích Nhất</h2>
            <Link to="/products" className="section-link">Xem tất cả →</Link>
          </div>
          <div className="products-grid">
            {mostFavorited.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🚚</span>
            <h4>Miễn phí vận chuyển</h4>
            <p>Cho đơn hàng từ 500.000đ</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">↩️</span>
            <h4>Đổi trả dễ dàng</h4>
            <p>Trong vòng 30 ngày</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <h4>Thanh toán an toàn</h4>
            <p>Bảo mật 100%</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <h4>Hỗ trợ 24/7</h4>
            <p>Luôn sẵn sàng phục vụ</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
