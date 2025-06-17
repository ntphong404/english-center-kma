import { TuitionFeeResponse } from '../types/tuitionfee';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const tuitionFeeApi = {
    getAll: (page: number, size: number, sort: string = 'tuitionFeeId,ASC') => {
        return axiosInstance.get<ApiResponse<PageResponse<TuitionFeeResponse>>>('/tuition-fees', {
            params: { page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<TuitionFeeResponse>>(`/tuition-fees/${id}`);
    },

    create: (tuitionFee: Partial<TuitionFeeResponse>) => {
        return axiosInstance.post<ApiResponse<TuitionFeeResponse>>('/tuition-fees', tuitionFee);
    },

    update: (id: string, tuitionFee: Partial<TuitionFeeResponse>) => {
        return axiosInstance.put<ApiResponse<TuitionFeeResponse>>(`/tuition-fees/${id}`, tuitionFee);
    },

    patch: (id: string, tuitionFee: Partial<TuitionFeeResponse>) => {
        return axiosInstance.patch<ApiResponse<TuitionFeeResponse>>(`/tuition-fees/${id}`, tuitionFee);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/tuition-fees/${id}`);
    },

    getByStudent: (studentId: string) => {
        return axiosInstance.get<ApiResponse<TuitionFeeResponse[]>>(`/tuition-fees/student/${studentId}`);
    },

    getByStudentAndMonth: (studentId: string, month: string) => {
        return axiosInstance.get<ApiResponse<TuitionFeeResponse>>(`/tuition-fees/student/${studentId}/month`, {
            params: { month }
        });
    },
};

export default tuitionFeeApi;