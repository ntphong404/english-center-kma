import { User } from '@/types/user';
import React from 'react';

// Custom event for user data changes
const USER_DATA_CHANGED_EVENT = 'userDataChanged';

// Lưu thông tin user
export const setUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent(USER_DATA_CHANGED_EVENT, { detail: user }));
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
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent(USER_DATA_CHANGED_EVENT, { detail: null }));
};

// Hook để lắng nghe thay đổi user data
export const useUserDataListener = (callback: (user: User | null) => void) => {
    React.useEffect(() => {
        const handleUserDataChange = (event: CustomEvent) => {
            callback(event.detail);
        };

        window.addEventListener(USER_DATA_CHANGED_EVENT, handleUserDataChange as EventListener);

        // Initial call with current user data
        callback(getUser());

        return () => {
            window.removeEventListener(USER_DATA_CHANGED_EVENT, handleUserDataChange as EventListener);
        };
    }, [callback]);
}; 