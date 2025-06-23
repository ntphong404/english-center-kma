import { LoginRequest, LoginResponse, LogoutRequest, VerifyOtpRequest, ResetPasswordRequest } from '../types/auth';
import { ApiResponse } from '../types/api';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const authApi = {
    login: async (data: LoginRequest) => {
        const response = await axios.post<ApiResponse<LoginResponse>>(`${API_URL}/auth/login`, data);
        const loginResponse = response.data.result;
        localStorage.setItem('user', JSON.stringify(loginResponse.user));
        localStorage.setItem('accessToken', loginResponse.accessToken);
        localStorage.setItem('refreshToken', loginResponse.refreshToken);
        localStorage.setItem('isAuthenticated', loginResponse.authenticated.toString());
        return loginResponse;
    },

    logout: async (data: LogoutRequest) => {
        try {
            await axios.post<ApiResponse<void>>(`${API_URL}/auth/logout`, data);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('isAuthenticated');
        }
    },

    refreshToken: async (data: string) => {
        const response = await axios.post<ApiResponse<string>>(`${API_URL}/auth/refresh`, { token: data });
        const accessToken = response.data.result;

        return accessToken;
    },

    introspect: () => {
        return axios.post<ApiResponse<boolean>>(`${API_URL}/auth/introspect`).then(response => response.data.result);
    },

    clearTokens: () => {
        return axios.post<ApiResponse<void>>(`${API_URL}/auth/clear`).then(response => response.data.result);
    },

    forgotPassword: (email: string) => {
        return axios.post<ApiResponse<void>>(`${API_URL}/auth/forgot-password`, null, { params: { email } }).then(response => response.data.result);
    },

    verifyOtp: (data: VerifyOtpRequest) => {
        return axios.post<ApiResponse<void>>(`${API_URL}/auth/verify-otp`, data).then(response => response.data.result);
    },

    resetPassword: (data: ResetPasswordRequest) => {
        return axios.post<ApiResponse<void>>(`${API_URL}/auth/reset-password`, data).then(response => response.data.result);
    }
};

export default authApi;