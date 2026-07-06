import axiosClient from './axiosClient';

const orderService = {
  getAll: () => axiosClient.get('/orders'),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  getMyOrders: () => axiosClient.get('/orders/my'),
  create: (data) => axiosClient.post('/orders', data),
  updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status }),
};

export default orderService;