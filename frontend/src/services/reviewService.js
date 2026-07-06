import axiosClient from './axiosClient';

const reviewService = {
  getByProduct: (productId) => axiosClient.get(`/reviews/product/${productId}`),
  getSummary: (productId) => axiosClient.get(`/reviews/product/${productId}/summary`),
  create: (data) => axiosClient.post('/reviews', data),
  // Admin: quản lý đánh giá
  getAll: () => axiosClient.get('/reviews'),
  delete: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default reviewService;