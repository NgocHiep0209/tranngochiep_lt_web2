import axiosClient from './axiosClient';
 
const productService = {
  getAll: () => axiosClient.get('/products'),
  getById: (id) => axiosClient.get(`/products/${id}`),
  getByCategory: (categoryId) => axiosClient.get(`/products/category/${categoryId}`),
  getPaged: ({ page = 0, size = 12, categoryId, keyword } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (categoryId) params.append('categoryId', categoryId);
    if (keyword) params.append('keyword', keyword);
    return axiosClient.get(`/products/page?${params.toString()}`);
  },
  search: (keyword) => axiosClient.get(`/products/search?keyword=${keyword}`),
  create: (data) => axiosClient.post('/products', data),
  update: (id, data) => axiosClient.put(`/products/${id}`, data),
  delete: (id) => axiosClient.delete(`/products/${id}`),
};
 
export default productService;