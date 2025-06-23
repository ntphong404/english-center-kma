import { BannerCourseResponse, CreateBannerCourseRequest, UpdateBannerCourseRequest } from '../types/bannercourse';
import { ApiResponse, PageResponse } from '../types/api';
import axiosInstance from '../services/axios';
import axios from 'axios';

export const bannerCourseApi = {
    getList: () => {
        return axios.get<ApiResponse<BannerCourseResponse[]>>(`${import.meta.env.VITE_API_URL}/banner-courses/all`);
    },

    getAll: (title?: string, description?: string, page?: number, size?: number, sort?: string) => {
        return axiosInstance.get<ApiResponse<PageResponse<BannerCourseResponse>>>('/banner-courses', {
            params: { title, description, page, size, sort }
        });
    },

    getById: (id: string) => {
        return axiosInstance.get<ApiResponse<BannerCourseResponse>>(`/banner-courses/${id}`);
    },

    create: (bannerCourse: CreateBannerCourseRequest | FormData) => {
        return axiosInstance.post<ApiResponse<BannerCourseResponse>>('/banner-courses', bannerCourse);
    },

    patch: (id: string, bannerCourse: Partial<UpdateBannerCourseRequest> | FormData) => {
        return axiosInstance.patch<ApiResponse<BannerCourseResponse>>(`/banner-courses/${id}`, bannerCourse);
    },

    delete: (id: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/banner-courses/${id}`);
    }
};
