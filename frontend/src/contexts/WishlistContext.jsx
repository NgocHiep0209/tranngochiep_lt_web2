import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import wishlistService from '../services/wishlistService';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isLoggedIn } = useAuth();
  // Set các productId đã yêu thích, để tra cứu O(1) trên ProductCard/ProductDetailPage
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(() => {
    if (!isLoggedIn()) {
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    wishlistService.getMyIds()
      .then((ids) => setWishlistIds(new Set(ids)))
      .catch((err) => console.error('Lỗi tải danh sách yêu thích:', err))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  // Tải lại mỗi khi trạng thái đăng nhập đổi (login/logout)
  useEffect(() => {
    refreshWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn()]);

  const isFavorited = (productId) => wishlistIds.has(productId);

  // Trả về true/false cho biết trạng thái MỚI sau khi toggle, để UI có thể hiện thông báo phù hợp.
  // Cập nhật lạc quan (optimistic) trước, gọi API sau, rollback nếu lỗi.
  const toggleWishlist = async (productId) => {
    if (!isLoggedIn()) {
      throw new Error('NOT_LOGGED_IN');
    }
    const wasFavorited = wishlistIds.has(productId);

    setWishlistIds((prev) => {
      const next = new Set(prev);
      wasFavorited ? next.delete(productId) : next.add(productId);
      return next;
    });

    try {
      if (wasFavorited) {
        await wishlistService.remove(productId);
      } else {
        await wishlistService.add(productId);
      }
      return !wasFavorited;
    } catch (err) {
      // Rollback nếu API lỗi
      setWishlistIds((prev) => {
        const next = new Set(prev);
        wasFavorited ? next.add(productId) : next.delete(productId);
        return next;
      });
      throw err;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isFavorited, toggleWishlist, refreshWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
