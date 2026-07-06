import axiosClient from './axiosClient';

const bannerService = {
  getActive: () => axiosClient.get('/banners/active'),
  getAll: () => axiosClient.get('/banners'),
  getById: (id) => axiosClient.get(`/banners/${id}`),
  create: (data) => axiosClient.post('/banners', data),
  update: (id, data) => axiosClient.put(`/banners/${id}`, data),
  delete: (id) => axiosClient.delete(`/banners/${id}`),
};

export default bannerService;
