import axiosInstance from '@/services/axios';
import { User, UserCreateRequest, UserUpdateRequest } from '@/types/User';

interface ApiResponse<T> {
    code: number;
    result: T;
}

// Lấy danh sách users
export const getUsers = () => {
    return axiosInstance.get<ApiResponse<User[]>>('/users');
};

// Lấy thông tin một user
export const getUser = (id: string) => {
    return axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
};

// Tạo user mới
export const createUser = (data: UserCreateRequest) => {
    return axiosInstance.post<ApiResponse<User>>('/users', data);
};

// Cập nhật thông tin user
export const updateUser = (id: string, data: Omit<UserUpdateRequest, 'id'>) => {
    return axiosInstance.put<ApiResponse<User>>(`/users/${id}`, data);
};

// Xóa user
export const deleteUser = (id: string) => {
    return axiosInstance.delete<ApiResponse<void>>(`/users/${id}`);
};