import axiosClient from './axiosClient';

const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Không tự set 'Content-Type' thủ công — để axios/trình duyệt tự thêm
    // boundary cho multipart/form-data, nếu không backend sẽ không đọc được file.
    return axiosClient.post('/upload', formData);
  },
};

export default uploadService;