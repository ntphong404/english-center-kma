import { CreateTeacherPaymentRequest, TeacherPaymentResponse } from '../types/teacherpayment';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

export const teacherPaymentApi = {
    getAll: (teacherId?: string, month?: number, year?: number, page?: number, size?: number, sort?: string) => {
        return axiosInstance.get<ApiResponse<PageResponse<TeacherPaymentResponse>>>('/teacher-payments', {
            params: { teacherId, month, year, page, size, sort }
        });
    },
    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<TeacherPaymentResponse>>(`/teacher-payments/${id}`);
    },
    create: (createTeacherPayment: CreateTeacherPaymentRequest) => {
        return axiosInstance.post<ApiResponse<TeacherPaymentResponse>>('/teacher-payments', createTeacherPayment);
    }
};