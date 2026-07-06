import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="product-card">
      <div className="product-card-img-wrapper">
        <img
          src={product.imageUrl || 'https://placehold.co/400x500/1a1a2e/ffffff?text=Fashion'}
          alt={product.name}
          className="product-card-img"
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x500/1a1a2e/ffffff?text=Fashion';
          }}
        />
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="product-badge">SALE</span>
        )}
        {product.stockQuantity === 0 && (
          <span className="product-badge out-of-stock">Hết hàng</span>
        )}
      </div>

      <div className="product-card-body">
        <p className="product-category">
          {product.category?.name || 'Thời trang'}
        </p>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-meta">
          {product.size && <span className="tag">Size: {product.size}</span>}
          {product.color && <span className="tag">Màu: {product.color}</span>}
        </div>

        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        <div className="product-card-actions">
          <Link to={`/products/${product.id}`} className="btn btn-outline">
            Chi tiết
          </Link>
          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
          >
            {product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
