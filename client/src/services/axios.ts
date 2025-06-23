import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Biến để kiểm tra xem đang trong quá trình refresh token hay không
let isRefreshing = false;
// Queue để lưu các request đang chờ refresh token
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Nếu data là FormData, không set Content-Type để browser tự set multipart boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Xử lý các lỗi từ server
            switch (error.response.status) {
                case 401:
                    if (!originalRequest._retry) {
                        if (isRefreshing) {
                            // Nếu đang trong quá trình refresh token, thêm request vào queue
                            return new Promise((resolve, reject) => {
                                failedQueue.push({ resolve, reject });
                            })
                                .then(token => {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                    return axiosInstance(originalRequest);
                                })
                                .catch(err => {
                                    return Promise.reject(err);
                                });
                        }

                        originalRequest._retry = true;
                        isRefreshing = true;

                        try {
                            // Lấy token hiện tại
                            const refreshToken = localStorage.getItem('refreshToken');
                            if (!refreshToken) {
                                throw new Error('No token available');
                            }

                            // Gọi API refresh với token trong request body
                            const response = await axios.post(
                                `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
                                { token: refreshToken }
                            );

                            // Lưu token mới
                            const newAccessToken = response.data.result.accessToken;
                            localStorage.setItem('accessToken', newAccessToken);

                            // Cập nhật header cho request gốc
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                            // Xử lý các request trong queue
                            processQueue(null, newAccessToken);

                            // Thực hiện lại request gốc
                            return axiosInstance(originalRequest);
                        } catch (refreshError) {
                            // Xử lý lỗi refresh token
                            processQueue(refreshError, null);

                            // Xóa token và các thông tin liên quan
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                            localStorage.removeItem('isAuthenticated');

                            // Chuyển hướng về trang login
                            window.location.href = '/login';
                            return Promise.reject(refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    }
                    break;
                case 400:
                    return Promise.reject(error);
                case 403:
                    // Xử lý lỗi forbidden
                    console.error('Không có quyền truy cập');
                    break;
                case 404:
                    // Xử lý lỗi not found
                    console.error('Không tìm thấy tài nguyên');
                    break;
                case 500:
                    // Xử lý lỗi server
                    console.error('Lỗi server');
                    break;
                default:
                    console.error('Có lỗi xảy ra: ahihi', error.response.data);
                    return Promise.reject(error);
            }
        } else if (error.request) {
            // Xử lý lỗi không nhận được response
            console.error('Không nhận được phản hồi từ server');
        } else {
            // Xử lý lỗi khi setting up request
            console.error('Lỗi khi gửi request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 