import axiosInstance from "../services/axios";
import { ApiResponse } from "../types/api";
import { Role } from "../types/role";

const roleApi = {
    get: (id: string) => {
        return axiosInstance.get<ApiResponse<Role>>(`/roles/${id}`);
    },

    getAll: () => {
        return axiosInstance.get<ApiResponse<Role[]>>('/roles');
    },

    create: (role: Partial<Role>) => {
        return axiosInstance.post<ApiResponse<Role>>('/roles', role);
    },

    delete: (roleName: string) => {
        return axiosInstance.delete<ApiResponse<void>>(`/roles/${roleName}`);
    },

    updatePermissions: (roleName: string, permissions: string[]) => {
        return axiosInstance.put<ApiResponse<Role>>(`/roles/${roleName}/permissions`, { permissions });
    },

    addPermissions: (roleName: string, permissions: string[]) => {
        return axiosInstance.post<ApiResponse<Role>>(`/roles/${roleName}/permissions`, { permissions });
    }
};

export default roleApi;