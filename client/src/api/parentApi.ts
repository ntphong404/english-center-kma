import { Parent, UserCreateRequest, UserUpdateRequest } from '../types/user';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const parentApi = {
    getAll: (fullName?: string, email?: string, page: number = 0, size: number = 10, sort: string = 'userId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<Parent>>>('/parents', {
            params: { fullName, email, page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<Parent>>(`/parents/${id}`);
    },

    create: (parent: UserCreateRequest) => {
        return axiosInstance.post<ApiResponse<Parent>>('/parents', parent);
    },

    patch: (id: string, parent: Partial<UserUpdateRequest>) => {
        return axiosInstance.patch<ApiResponse<Parent>>(`/parents/${id}`, parent);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/parents/${id}`);
    },

    addStudent: (parentId: string, id: string) => {
        return axiosInstance.post<ApiResponse<void>>(`/parents/${parentId}/add-student`, { id });
    },

    removeStudent: (parentId: string, id: string) => {
        return axiosInstance.post<ApiResponse<void>>(`/parents/${parentId}/remove-student`, { id });
    },
};

export default parentApi;