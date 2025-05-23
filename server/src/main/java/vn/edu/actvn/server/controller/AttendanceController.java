package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.CreateAttendanceRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.AttendanceResponse;
import vn.edu.actvn.server.dto.request.AttendanceUpdateRequest;
import vn.edu.actvn.server.service.AttendanceService;
import vn.edu.actvn.server.entity.Attendance;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendances")
@Tag(name = "Attendance", description = "APIs for managing attendance records")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AttendanceController {

    AttendanceService attendanceService;

    @PostMapping
    @Operation(summary = "Create a new attendance record")
    public ApiResponse<AttendanceResponse> create(@RequestBody CreateAttendanceRequest request) {
        return ApiResponse.<AttendanceResponse>builder()
                .result(attendanceService.createAttendance(request))
                .message("Attendance created successfully")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all attendance records")
    public ApiResponse<List<AttendanceResponse>> getAll() {
        return ApiResponse.<List<AttendanceResponse>>builder()
                .result(attendanceService.getAllAttendance())
                .message("All attendance records fetched")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attendance by ID")
    public ApiResponse<AttendanceResponse> getById(@PathVariable String id) {
        return ApiResponse.<AttendanceResponse>builder()
                .result(attendanceService.getAttendanceById(id))
                .message("Attendance fetched by ID")
                .build();
    }

    @GetMapping("/class")
    @Operation(summary = "Get attendance by class and date")
    public ApiResponse<List<AttendanceResponse>> getByClassDate(@RequestParam String classId, @RequestParam LocalDate date) {
        return ApiResponse.<List<AttendanceResponse>>builder()
                .result(attendanceService.getAttendanceByClassIdAndDate(classId, date))
                .message("Attendance fetched by class and date")
                .build();
    }

    @GetMapping("/class/status")
    @Operation(summary = "Get attendance by class, date and status")
    public ApiResponse<List<AttendanceResponse>> getByClassDateStatus(@RequestParam String classId, @RequestParam LocalDate date, @RequestParam Attendance.Status status) {
        return ApiResponse.<List<AttendanceResponse>>builder()
                .result(attendanceService.getAttendanceByClassIdAndDateAndStatus(classId, date, status))
                .message("Attendance fetched by class, date and status")
                .build();
    }

    @GetMapping("/student")
    @Operation(summary = "Get attendance by student ID")
    public ApiResponse<List<AttendanceResponse>> getByStudent(@RequestParam String studentId) {
        return ApiResponse.<List<AttendanceResponse>>builder()
                .result(attendanceService.getAttendanceByStudentId(studentId))
                .message("Attendance fetched by student ID")
                .build();
    }

    @GetMapping("/student/class")
    @Operation(summary = "Get attendance by student and class")
    public ApiResponse<List<AttendanceResponse>> getByStudentClass(@RequestParam String studentId, @RequestParam String classId) {
        return ApiResponse.<List<AttendanceResponse>>builder()
                .result(attendanceService.getAttendanceByStudentIdAndClassId(studentId, classId))
                .message("Attendance fetched by student and class")
                .build();
    }

    @GetMapping("/student/date")
    @Operation(summary = "Get attendance by student and date")
    public ApiResponse<List<AttendanceResponse>> getByStudentDate(@RequestParam String studentId, @RequestParam LocalDate date) {
        return ApiResponse.<List<AttendanceResponse>>builder()
                .result(attendanceService.getAttendanceByStudentIdAndDate(studentId, date))
                .message("Attendance fetched by student and date")
                .build();
    }

    @GetMapping("/date")
    @Operation(summary = "Get attendance by date")
    public ApiResponse<List<AttendanceResponse>> getByDate(@RequestParam LocalDate date) {
        return ApiResponse.<List<AttendanceResponse>>builder()
                .result(attendanceService.getAttendanceByDate(date))
                .message("Attendance fetched by date")
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update attendance by ID")
    public ApiResponse<AttendanceResponse> update(@PathVariable String id, @RequestBody AttendanceUpdateRequest request) {
        return ApiResponse.<AttendanceResponse>builder()
                .result(attendanceService.updateAttendance(id, request))
                .message("Attendance updated successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete attendance by ID")
    public ApiResponse<Void> delete(@PathVariable String id) {
        attendanceService.deleteAttendance(id);
        return ApiResponse.<Void>builder()
                .message("Attendance deleted successfully")
                .build();
    }

    @GetMapping("/count")
    @Operation(summary = "Count attendance by student and status")
    public ApiResponse<Long> count(@RequestParam String studentId, @RequestParam Attendance.Status status) {
        return ApiResponse.<Long>builder()
                .result(attendanceService.CountAttendanceByStudentIdAndStatus(studentId, status))
                .message("Attendance count fetched")
                .build();
    }
}
