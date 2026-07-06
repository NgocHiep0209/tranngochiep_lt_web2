import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import { useCart } from '../../contexts/CartContext';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    productService.getById(id)
      .then((res) => setProduct(res))
      .catch((err) => {
        console.error(err);
        navigate('/products');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Trang chủ</span>
        <span> / </span>
        <span onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>Sản phẩm</span>
        <span> / </span>
        <span className="active">{product.name}</span>
      </div>

      <div className="detail-content">
        <div className="detail-image-wrapper">
          <img
            src={product.imageUrl || 'https://placehold.co/600x700/1a1a2e/ffffff?text=Fashion'}
            alt={product.name}
            className="detail-image"
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x700/1a1a2e/ffffff?text=Fashion';
            }}
          />
          {product.stockQuantity === 0 && (
            <div className="detail-out-of-stock">Hết hàng</div>
          )}
        </div>

        <div className="detail-info">
          {product.category && (
            <p className="detail-category">{product.category.name}</p>
          )}
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-price-row">
            <span className="detail-price">{formatPrice(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="detail-old-price">{formatPrice(product.oldPrice)}</span>
            )}
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="detail-discount">
                -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
              </span>
            )}
          </div>

          <div className="detail-specs">
            {product.size && (
              <div className="spec-row">
                <span className="spec-label">📏 Kích cỡ:</span>
                <span className="spec-value">{product.size}</span>
              </div>
            )}
            {product.color && (
              <div className="spec-row">
                <span className="spec-label">🎨 Màu sắc:</span>
                <span className="spec-value">{product.color}</span>
              </div>
            )}
            {product.material && (
              <div className="spec-row">
                <span className="spec-label">🧵 Chất liệu:</span>
                <span className="spec-value">{product.material}</span>
              </div>
            )}
            <div className="spec-row">
              <span className="spec-label">📦 Tồn kho:</span>
              <span className={`spec-value ${product.stockQuantity === 0 ? 'out-stock-text' : 'in-stock-text'}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} sản phẩm` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {product.description && (
            <div className="detail-description">
              <h4>Mô tả sản phẩm</h4>
              <p>{product.description}</p>
            </div>
          )}

          {product.stockQuantity > 0 && (
            <div className="detail-add-cart">
              <div className="quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >−</button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                >+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                🛒 Thêm vào giỏ hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
