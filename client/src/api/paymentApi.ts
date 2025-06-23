import { PaymentResponse } from '../types/payment';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const paymentApi = {
    getAll: (studentId?: string, classId?: string, page: number = 0, size: number = 10, sort: string = 'id,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<PaymentResponse>>>('/payments', {
            params: { studentId, classId, page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<PaymentResponse>>(`/payments/${id}`);
    },

    create: (payment: Partial<PaymentResponse>) => {
        return axiosInstance.post<ApiResponse<PaymentResponse>>('/payments', payment);
    },

    patch: (id: string, payment: Partial<PaymentResponse>) => {
        return axiosInstance.patch<ApiResponse<PaymentResponse>>(`/payments/${id}`, payment);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/payments/${id}`);
    },
};

export default paymentApi;