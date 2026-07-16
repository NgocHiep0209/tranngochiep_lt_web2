import axiosClient from './axiosClient';

const chatService = {
  // ===== Khách hàng (đã đăng nhập) =====
  getMyMessages: () => axiosClient.get('/chat/my'),
  sendMyMessage: (content) => axiosClient.post('/chat/my', { content }),
  markMyRead: () => axiosClient.put('/chat/my/read'),
  getMyUnreadCount: () => axiosClient.get('/chat/my/unread-count'),

  // ===== Admin =====
  getConversations: () => axiosClient.get('/chat/conversations'),
  getCustomerMessages: (customerId) => axiosClient.get(`/chat/customer/${customerId}`),
  sendToCustomer: (customerId, content) => axiosClient.post(`/chat/customer/${customerId}`, { content }),
  markCustomerRead: (customerId) => axiosClient.put(`/chat/customer/${customerId}/read`),
};

export default chatService;
