import { PaymentResponse } from '../types/payment';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const paymentApi = {
    getAll: (page: number, size: number, sort: string = 'id,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<PaymentResponse>>>('/payments', {
            params: { page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<PaymentResponse>>(`/payments/${id}`);
    },

    create: (payment: Partial<PaymentResponse>) => {
        return axiosInstance.post<ApiResponse<PaymentResponse>>('/payments', payment);
    },

    update: (id: string, payment: Partial<PaymentResponse>) => {
        return axiosInstance.patch<ApiResponse<PaymentResponse>>(`/payments/${id}`, payment);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/payments/${id}`);
    },

    getByStudent: (studentId: string) => {
        return axiosInstance.get<ApiResponse<PaymentResponse[]>>(`/payments/student/${studentId}`);
    },

    getByStudentAndClass: (studentId: string, classId: string) => {
        return axiosInstance.get<ApiResponse<PaymentResponse[]>>(`/payments/student/${studentId}/class/${classId}`);
    },
};

export default paymentApi;