import axiosInstance from "@/services/axios";
import { ApiResponse } from "@/types/api";
import { DashboardResponse } from "@/types/DashboardResponse";

const dashboardApi = {
    getAdminDashboard: (month: number, year: number) => {
        return axiosInstance.get<ApiResponse<DashboardResponse>>('/dashboards/admin', {
            params: {
                month,
                year
            }
        });
    }
}

export default dashboardApi;