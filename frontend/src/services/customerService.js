import axiosClient from './axiosClient';

const customerService = {
  getAll: () => axiosClient.get('/customers'),
  getById: (id) => axiosClient.get(`/customers/${id}`),
  register: (data) => axiosClient.post('/customers/register', data),
  login: (data) => axiosClient.post('/customers/login', data),
  // Admin: quản lý thành viên
  create: (data) => axiosClient.post('/customers', data),
  update: (id, data) => axiosClient.put(`/customers/${id}`, data),
  delete: (id) => axiosClient.delete(`/customers/${id}`),
};

export default customerService;
