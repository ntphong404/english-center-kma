import { User } from '../types/user';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

export const userApi = {
    getAll: (page: number = 0, size: number = 10, sort: string = 'userId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<User>>>('/users', {
            params: { page, size, sort }
        });
    },

    getById: (userId: string) => {
        return axiosInstance.get<ApiResponse<User>>(`/users/${userId}`);
    },

    getByRoleName: (roleName: string, page: number = 0, size: number = 10, sort: string = 'userId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<User>>>(`/users/role/${roleName}`, {
            params: { page, size, sort }
        });
    },

    getCurrentUser: () => {
        return axiosInstance.get<ApiResponse<User>>('/users/me');
    },

    create: (user: Partial<User>) => {
        return axiosInstance.post<ApiResponse<User>>('/users', user);
    },

    update: (userId: string, user: Partial<User>) => {
        return axiosInstance.put<ApiResponse<User>>(`/users/${userId}`, user);
    },

    patch: (userId: string, user: Partial<User>) => {
        return axiosInstance.patch<ApiResponse<User>>(`/users/${userId}`, user);
    },

    delete: (userId: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/users/${userId}`);
    },

    changePassword: (oldPassword: string, newPassword: string) => {
        return axiosInstance.post<ApiResponse<void>>('/users/change-password', {
            oldPassword,
            newPassword
        });
    },

    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post<ApiResponse<string>>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};