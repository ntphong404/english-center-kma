import { User } from '@/types/user';

// Lưu thông tin user
export const setUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Lấy thông tin user
export const getUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Lấy role của user
export const getUserRole = (): string | null => {
    const user = getUser();
    return user?.role.toLowerCase() || null;
};

// Cập nhật thông tin user
export const updateUser = (userData: Partial<User>) => {
    const currentUser = getUser();
    if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        setUser(updatedUser);
    }
};

// Xóa thông tin user
export const removeUser = () => {
    localStorage.removeItem('user');
}; 