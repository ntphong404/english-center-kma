import { ApiResponse } from '../types/api';
import axiosInstance from '../services/axios';

export const uploadApi = {
    uploadBanner: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post<ApiResponse<string>>('/upload/banner', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post<ApiResponse<string>>('/upload/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
};
