import axiosClient from './axiosClient';

const customerService = {
  getAll: () => axiosClient.get('/customers'),
  getById: (id) => axiosClient.get(`/customers/${id}`),
  register: (data) => axiosClient.post('/customers/register', data),
  login: (data) => axiosClient.post('/customers/login', data),
  // Tự phục vụ: khách hàng đang đăng nhập xem/sửa thông tin của chính mình
  getMe: () => axiosClient.get('/customers/me'),
  updateMe: (data) => axiosClient.put('/customers/me', data),
  changeMyPassword: (data) => axiosClient.put('/customers/me/password', data),
  // Admin: quản lý thành viên
  create: (data) => axiosClient.post('/customers', data),
  update: (id, data) => axiosClient.put(`/customers/${id}`, data),
  delete: (id) => axiosClient.delete(`/customers/${id}`),
};

export default customerService;
