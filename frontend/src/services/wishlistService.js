import axiosClient from './axiosClient';

const wishlistService = {
  getMy: () => axiosClient.get('/wishlist/my'),
  getMyIds: () => axiosClient.get('/wishlist/my/ids'),
  add: (productId) => axiosClient.post('/wishlist', { productId }),
  remove: (productId) => axiosClient.delete(`/wishlist/${productId}`),
  // Public - danh sách sản phẩm được yêu thích nhiều nhất, dùng ở trang chủ
  getMostFavorited: (limit = 8) => axiosClient.get(`/wishlist/most-favorited?limit=${limit}`),
};

export default wishlistService;
