import { ClassResponse, CreateClassRequest, ClassUpdateRequest } from '../types/entityclass';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

export const classApi = {
    getAll: (className?: string, teacherId?: string, studentId?: string, grade?: number, page?: number, size?: number, sort?: string) => {
        return axiosInstance.get<ApiResponse<PageResponse<ClassResponse>>>('/classes', {
            params: { className, teacherId, studentId, grade, page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<ClassResponse>>(`/classes/${id}`);
    },

    create: (entityClass: Partial<CreateClassRequest>) => {
        return axiosInstance.post<ApiResponse<ClassResponse>>('/classes', entityClass);
    },

    patch: (id: string, entityClass: Partial<ClassUpdateRequest>) => {
        return axiosInstance.patch<ApiResponse<ClassResponse>>(`/classes/${id}`, entityClass);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/classes/${id}`);
    },

    addStudents: (classId: string, ids: string[]) => {
        return axiosInstance.post<ApiResponse<void>>(`/classes/${classId}/students`, { ids });
    },

    removeStudent: (classId: string, id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/classes/${classId}/students`, {
            data: { id }
        });
    },

}; 