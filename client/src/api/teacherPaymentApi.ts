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
    },
    getMySalary: (month?: number, year?: number, page?: number, size?: number, sort?: string[]) => {
        return axiosInstance.get<ApiResponse<PageResponse<TeacherPaymentResponse>>>(
            '/teacher-payments/salary',
            {
                params: { month, year, page, size, sort },
                paramsSerializer: params => {
                    // Xử lý mảng sort thành nhiều param sort=...
                    const searchParams = new URLSearchParams();
                    Object.entries(params).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            value.forEach(v => searchParams.append(key, v));
                        } else if (value !== undefined) {
                            searchParams.append(key, value as string);
                        }
                    });
                    return searchParams.toString();
                }
            }
        );
    }
};