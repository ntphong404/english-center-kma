import { Student, CreateStudentRequest, UpdateStudentRequest } from '../types/user';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const studentApi = {
    getAll: (page: number = 0, size: number = 10, sort: string = 'userId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<Student>>>('/students', {
            params: { page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<Student>>(`/students/${id}`);
    },

    create: (student: CreateStudentRequest) => {
        return axiosInstance.post<ApiResponse<Student>>('/students', student);
    },

    update: (id: string, student: UpdateStudentRequest) => {
        return axiosInstance.put<ApiResponse<Student>>(`/students/${id}`, student);
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
};

export default studentApi;
