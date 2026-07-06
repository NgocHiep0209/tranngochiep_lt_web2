import axiosClient from './axiosClient';

const postService = {
  // Public
  getActive: () => axiosClient.get('/posts/active'),
  getById: (id) => axiosClient.get(`/posts/${id}`),
  // Admin
  getAll: () => axiosClient.get('/posts'),
  create: (data) => axiosClient.post('/posts', data),
  update: (id, data) => axiosClient.put(`/posts/${id}`, data),
  delete: (id) => axiosClient.delete(`/posts/${id}`),
};

export default postService;
