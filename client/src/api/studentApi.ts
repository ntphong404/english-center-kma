import { Student, CreateStudentRequest, UpdateStudentRequest } from '../types/user';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const studentApi = {
    getAll: (fullName?: string, email?: string, page: number = 0, size: number = 10, sort: string = 'userId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<Student>>>('/students', {
            params: { fullName, email, page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<Student>>(`/students/${id}`);
    },

    create: (student: CreateStudentRequest) => {
        return axiosInstance.post<ApiResponse<Student>>('/students', student);
    },

    patch: (id: string, student: Partial<UpdateStudentRequest>) => {
        return axiosInstance.patch<ApiResponse<Student>>(`/students/${id}`, student);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/students/${id}`);
    },

    getByIds: (ids: string[]) => {
        return axiosInstance.post<ApiResponse<Student[]>>('/students/studentIds', { ids });
    },

    getByParentId: (parentId: string, page: number = 0, size: number = 100) => {
        return axiosInstance.get<ApiResponse<PageResponse<Student>>>(`/students/parent/${parentId}`, {
            params: { page, size }
        });
    },

    countNoClass: () => {
        return axiosInstance.get<ApiResponse<number>>('/students/count-no-class');
    },

    countNoClassByMonth: (month: number, year: number) => {
        return axiosInstance.get<ApiResponse<number>>('/students/count-no-class-by-month', {
            params: { month, year }
        });
    },

    countByCreatedAt: (month: number, year: number) => {
        return axiosInstance.get<ApiResponse<number>>('/students/count-by-created-at', {
            params: { month, year }
        });
    }
};

export default studentApi;
