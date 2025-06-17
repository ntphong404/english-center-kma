import { Teacher, CreateTeacherRequest, UpdateTeacherRequest } from '../types/user';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const teacherApi = {
    getAll: (page: number = 0, size: number = 10, sort: string = 'userId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<Teacher>>>('/teachers', {
            params: { page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<Teacher>>(`/teachers/${id}`);
    },

    create: (teacher: CreateTeacherRequest) => {
        return axiosInstance.post<ApiResponse<Teacher>>('/teachers', teacher);
    },

    update: (id: string, teacher: UpdateTeacherRequest) => {
        return axiosInstance.put<ApiResponse<Teacher>>(`/teachers/${id}`, teacher);
    },

    patch: (id: string, teacher: Partial<UpdateTeacherRequest>) => {
        return axiosInstance.patch<ApiResponse<Teacher>>(`/teachers/${id}`, teacher);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/teachers/${id}`);
    },
};

export default teacherApi;