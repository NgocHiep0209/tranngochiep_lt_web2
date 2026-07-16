import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import wishlistService from '../../services/wishlistService';
import ProductCard from '../../components/user/ProductCard';

function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    wishlistService.getMy()
      .then(setItems)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lọc theo wishlistIds (context) để khi bấm bỏ yêu thích ngay trên card,
  // sản phẩm biến mất khỏi trang này ngay lập tức, không cần tải lại trang.
  const visibleItems = items.filter((w) => wishlistIds.has(w.productId));

  // ProductCard cần object "product" chuẩn (id, name, price, imageUrl...) — Wishlist entity
  // trả về các field productXxx riêng lẻ (xem WishlistService bên backend), map lại cho khớp.
  const toProduct = (w) => ({
    id: w.productId,
    name: w.productName,
    imageUrl: w.productImageUrl,
    price: w.productPrice,
    oldPrice: w.productOldPrice,
    stockQuantity: w.productStockQuantity,
  });

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <h1>❤️ Sản phẩm yêu thích</h1>

      {visibleItems.length === 0 ? (
        <div className="empty-state">
          <span>💔</span>
          <p>Bạn chưa có sản phẩm yêu thích nào</p>
          <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
        </div>
      ) : (
        <div className="products-grid">
          {visibleItems.map((w) => (
            <ProductCard key={w.id} product={toProduct(w)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
