import axiosInstance from '@/services/axios';
import Student from '@/types/Student';

// Lấy danh sách học sinh
export const getStudents = () => {
    return axiosInstance.get<Student[]>('/users').then(response => {
        // Lọc ra các user có role STUDENT
        return {
            ...response,
            data: response.data.filter(user =>
                user.roles.some(role => role.name === 'STUDENT')
            )
        };
    });
};

// Lấy thông tin một học sinh
export const getStudent = (id: string) => {
    return axiosInstance.get<Student>(`/users/${id}`);
};

// Tạo học sinh mới
export const createStudent = (data: Omit<Student, 'id'>) => {
    return axiosInstance.post<Student>('/users', {
        ...data,
        roles: [{ name: 'STUDENT', description: 'Student role' }]
    });
};

// Cập nhật thông tin học sinh
export const updateStudent = (id: string, data: Partial<Student>) => {
    return axiosInstance.put<Student>(`/users/${id}`, data);
};

// Xóa học sinh
export const deleteStudent = (id: string) => {
    return axiosInstance.delete(`/users/${id}`);
}; 