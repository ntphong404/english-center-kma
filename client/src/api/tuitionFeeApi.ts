import { TuitionFeeResponse } from '../types/tuitionfee';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const tuitionFeeApi = {
    getAll: (studentId?: string, yearMonth?: string, page: number = 0, size: number = 10, sort: string = 'tuitionFeeId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<TuitionFeeResponse>>>('/tuition-fees', {
            params: { studentId, yearMonth, page, size, sort } // yearMonth: 2025-01
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<TuitionFeeResponse>>(`/tuition-fees/${id}`);
    },

    create: (tuitionFee: Partial<TuitionFeeResponse>) => {
        return axiosInstance.post<ApiResponse<TuitionFeeResponse>>('/tuition-fees', tuitionFee);
    },

    patch: (id: string, tuitionFee: Partial<TuitionFeeResponse>) => {
        return axiosInstance.patch<ApiResponse<TuitionFeeResponse>>(`/tuition-fees/${id}`, tuitionFee);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/tuition-fees/${id}`);
    },
};

export default tuitionFeeApi;