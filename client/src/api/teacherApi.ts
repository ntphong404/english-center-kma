import { Teacher, CreateTeacherRequest, UpdateTeacherRequest } from '../types/user';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const teacherApi = {
    getAll: (fullName?: string, email?: string, page: number = 0, size: number = 10, sort: string = 'userId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<Teacher>>>('/teachers', {
            params: { fullName, email, page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<Teacher>>(`/teachers/${id}`);
    },

    create: (teacher: CreateTeacherRequest) => {
        return axiosInstance.post<ApiResponse<Teacher>>('/teachers', teacher);
    },

    patch: (id: string, teacher: Partial<UpdateTeacherRequest>) => {
        return axiosInstance.patch<ApiResponse<Teacher>>(`/teachers/${id}`, teacher);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/teachers/${id}`);
    },
};

export default teacherApi;