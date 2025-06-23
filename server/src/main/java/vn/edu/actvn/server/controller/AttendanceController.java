package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.attendance.AttendanceUpdateRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.attendance.AttendanceResponse;
import vn.edu.actvn.server.entity.Attendance;
import vn.edu.actvn.server.service.AttendanceService;

import java.time.LocalDate;

@RestController
@RequestMapping("/attendances")
@RequiredArgsConstructor
@Tag(name = "Attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/today/{classId}")
    @Operation(summary = "Get today's attendance",
            description = "Returns today's attendance for the class. If not exists, create with default absent values")
    public ApiResponse<AttendanceResponse> getTodayAttendance(@PathVariable String classId) {
        return ApiResponse.<AttendanceResponse>builder()
                .result(attendanceService.getAttendanceToday(classId))
                .message("Fetched today's attendance")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attendance by ID")
    public ApiResponse<AttendanceResponse> getById(@PathVariable String id) {
        return ApiResponse.<AttendanceResponse>builder()
                .result(attendanceService.getById(id))
                .message("Fetched attendance")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update an attendance")
    public ApiResponse<AttendanceResponse> partialUpdateAttendance(
            @PathVariable("id") String id,
            @RequestBody AttendanceUpdateRequest request
    ) {
        return ApiResponse.<AttendanceResponse>builder()
                .result(attendanceService.partialUpdateAttendance(id, request))
                .message("Attendance updated successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete attendance by ID for debugging purposes")
    public ApiResponse<String> delete(@PathVariable String id) {
        attendanceService.delete(id);
        return ApiResponse.<String>builder()
                .result("Attendance has been deleted")
                .message("Deleted attendance successfully")
                .build();
    }

    @GetMapping("/count/student")
    @Operation(summary = "Get attendance count by student ID and status")
    public ApiResponse<Long> getAttendanceCountByStudentIdAndStatus(
            @RequestParam ("classId") String classId,
            @RequestParam ("studentId") String studentId,
            @RequestParam ("status") Attendance.Status status
    ) {
        long count = attendanceService.countByStudentIdAndStatus(classId, studentId, status);
        return ApiResponse.<Long>builder()
                .result(count)
                .message("Fetched attendance count by student ID and status")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all attendances with pagination and sorting")
    public ApiResponse<Page<AttendanceResponse>> getAllAttendances(
            @RequestParam(value = "studentId", required = false) String studentId,
            @RequestParam(value = "classId", required = false) String classId,
            @RequestParam(value = "date", required = false) LocalDate date,
            @ParameterObject @PageableDefault(sort = "date", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AttendanceResponse> attendances = attendanceService.getAll(studentId,classId, date, pageable);
        return ApiResponse.<Page<AttendanceResponse>>builder()
                .result(attendances)
                .message("Fetched all attendances")
                .build();
    }
}
