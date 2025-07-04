package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.dashboard.AdminAnalyticsResponse;
import vn.edu.actvn.server.dto.response.dashboard.AdminDashboardResponse;
import vn.edu.actvn.server.service.DashboardService;

@RestController
@RequestMapping("/dashboards")
@Tag(name = "Dashboard", description = "Dashboard API for various statistics and insights")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DashboardController {
    DashboardService dashboardService;

    @GetMapping("/admin")
    public ApiResponse<AdminDashboardResponse> getAdminDashboard(
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        return ApiResponse.<AdminDashboardResponse>builder()
                .result(dashboardService.getAdminDashboard(month, year))
                .message("Fetched admin dashboard statistics")
                .build();
    }

    @GetMapping("/admin/analytics")
    public ApiResponse<AdminAnalyticsResponse> getAdminAnalytics() {
        return ApiResponse.<AdminAnalyticsResponse>builder()
                .result(dashboardService.getAnalyticsDashboard())
                .message("Fetched admin analytics")
                .build();
    }


}
