package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.user.CreateTeacherRequest;
import vn.edu.actvn.server.dto.request.user.UpdateTeacherRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.service.TeacherService;

import java.util.List;

@RestController
@RequestMapping("/teachers")
@RequiredArgsConstructor
@Tag(name = "Teacher API", description = "Endpoints for teacher management")
public class TeacherController {
    private final TeacherService teacherService;

    @GetMapping
    @Operation(summary = "Get all teachers")
    public ApiResponse<Page<UserResponse>> getAllTeachers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "username,asc") String sort
    ) {
        Sort pageSort;
        String[] sortPart = sort.split(",");
        String direction = sortPart.length > 1 ? sortPart[1] : "asc";
        String sortField = sortPart[0].trim();
        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
        String actualSortField = "fullName".equalsIgnoreCase(sortField) ? "lastName" : sortField;

        pageSort = Sort.by(sortDirection, actualSortField);

        Pageable pageable = PageRequest.of(page, size, pageSort);
        return ApiResponse.<Page<UserResponse>>builder()
                .result(teacherService.getAllTeachers(pageable))
                .message("Fetched all teachers")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get teacher by ID")
    public ApiResponse<UserResponse> getTeacherById(@PathVariable String id) {
        return ApiResponse.<UserResponse>builder()
                .result(teacherService.getTeacherById(id))
                .message("Fetched teacher information")
                .build();
    }

    @PostMapping
    @Operation(summary = "Create a new teacher")
    public ApiResponse<UserResponse> createTeacher(@RequestBody CreateTeacherRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(teacherService.createTeacher(request))
                .message("Teacher created successfully")
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update teacher information")
    public ApiResponse<UserResponse> updateTeacher(@PathVariable String id, @RequestBody UpdateTeacherRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(teacherService.updateTeacher(id, request))
                .message("Teacher updated successfully")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update teacher information")
    public ApiResponse<UserResponse> patchTeacher(@PathVariable String id, @RequestBody UpdateTeacherRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(teacherService.patchTeacher(id, request))
                .message("Teacher partially updated successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a teacher by ID")
    public ApiResponse<String> deleteTeacher(@PathVariable String id) {
        teacherService.deleteTeacher(id);
        return ApiResponse.<String>builder()
                .result("Teacher has been deleted")
                .message("Teacher deleted successfully")
                .build();
    }
}