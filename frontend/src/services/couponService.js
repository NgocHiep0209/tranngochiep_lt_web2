import axiosClient from './axiosClient';

const couponService = {
  getAll: () => axiosClient.get('/coupons'),
  getById: (id) => axiosClient.get(`/coupons/${id}`),
  create: (data) => axiosClient.post('/coupons', data),
  update: (id, data) => axiosClient.put(`/coupons/${id}`, data),
  delete: (id) => axiosClient.delete(`/coupons/${id}`),
  // Public: kiểm tra mã giảm giá lúc checkout
  validate: (code, orderAmount) => axiosClient.post('/coupons/validate', { code, orderAmount }),
  // Voucher center (thanh điều hướng): danh sách mã có thể nhận
  getAvailable: (customerId) =>
    axiosClient.get(`/coupons/available${customerId ? `?customerId=${customerId}` : ''}`),
  // Nhận 1 voucher về ví của khách
  claim: (customerId, couponId) => axiosClient.post('/coupons/claim', { customerId, couponId }),
  // Ví voucher của khách (dùng ở trang thanh toán)
  getMyCoupons: (customerId) => axiosClient.get(`/coupons/my?customerId=${customerId}`),
};

export default couponService;
