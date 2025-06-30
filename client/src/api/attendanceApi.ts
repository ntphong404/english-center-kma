import { AttendanceResponse } from '../types/attendance';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';

const attendanceApi = {
    getAll: (studentId: string, classId: string, date: string, page?: number, size?: number, sort?: string) => {
        const params: Record<string, any> = {};
        if (studentId !== undefined) params.studentId = studentId;
        if (classId !== undefined) params.classId = classId;
        if (date !== undefined) params.date = date;
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;
        if (sort !== undefined) params.sort = sort;
        return axiosInstance.get<ApiResponse<PageResponse<AttendanceResponse[]>>>(`/attendances`, { params });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<AttendanceResponse>>(`/attendances/${id}`);
    },

    getTodayByClass: (classId: string) => {
        return axiosInstance.get<ApiResponse<AttendanceResponse>>(`/attendances/today/${classId}`);
    },

    create: (attendance: Partial<AttendanceResponse>) => {
        return axiosInstance.post<ApiResponse<AttendanceResponse>>('/attendances', attendance);
    },

    patch: (id: string, attendance: Partial<AttendanceResponse>) => {
        return axiosInstance.patch<ApiResponse<AttendanceResponse>>(`/attendances/${id}`, attendance);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/attendances/${id}`);
    },
};

export default attendanceApi;