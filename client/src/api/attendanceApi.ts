import { AttendanceResponse } from '../types/attendance';
import { ApiResponse } from '../types/api';
import axiosInstance from '../services/axios';

const attendanceApi = {
    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<AttendanceResponse>>(`/attendances/${id}`);
    },

    getTodayByClass: (classId: string) => {
        return axiosInstance.get<ApiResponse<AttendanceResponse[]>>(`/attendances/today/${classId}`);
    },

    getByClass: (classId: string) => {
        return axiosInstance.get<ApiResponse<AttendanceResponse[]>>(`/attendances/class/${classId}`);
    },

    create: (attendance: Partial<AttendanceResponse>) => {
        return axiosInstance.post<ApiResponse<AttendanceResponse>>('/attendances', attendance);
    },

    update: (id: string, attendance: Partial<AttendanceResponse>) => {
        return axiosInstance.put<ApiResponse<AttendanceResponse>>(`/attendances/${id}`, attendance);
    },

    patch: (id: string, attendance: Partial<AttendanceResponse>) => {
        return axiosInstance.patch<ApiResponse<AttendanceResponse>>(`/attendances/${id}`, attendance);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/attendances/${id}`);
    },
};

export default attendanceApi;