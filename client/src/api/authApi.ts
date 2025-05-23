import axios from 'axios';
import { LoginRequest, LoginResponse } from '@/types/auth';
import { ApiResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Đăng nhập
export const login = async (data: LoginRequest) => {
    const response = await axios.post<ApiResponse<LoginResponse>>(`${API_URL}/auth/login`, data);
    const { token, authenticated } = response.data.result;

    // Lưu token và thông tin user vào localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('isAuthenticated', authenticated.toString());

    return response.data.result.user;
};

// Đăng xuất
export const logout = async () => {
    try {
        await axios.post(`${API_URL}/auth/logout`);
    } finally {
        // Xóa token và thông tin user khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
    }
};
