package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springdoc.core.annotations.ParameterObject;
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

@RestController
@RequestMapping("/teachers")
@RequiredArgsConstructor
@Tag(name = "Teacher API", description = "Endpoints for teacher management")
public class TeacherController {
    private final TeacherService teacherService;

    @GetMapping
    @Operation(summary = "Get all teachers")
    public ApiResponse<Page<UserResponse>> getAllTeachers(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "email", required = false) String email,
            @ParameterObject Pageable pageable
    ) {
        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            String sortField = order.getProperty();
            Sort.Direction sortDirection = order.getDirection();
            String actualSortField = "fullName".equalsIgnoreCase(sortField) ? "lastName" : sortField;
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(sortDirection, actualSortField));
        }
        return ApiResponse.<Page<UserResponse>>builder()
                .result(teacherService.getAllTeachers(fullName,email,pageable))
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
    public ApiResponse<UserResponse> createTeacher(@RequestBody @Valid CreateTeacherRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(teacherService.createTeacher(request))
                .message("Teacher created successfully")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update teacher information")
    public ApiResponse<UserResponse> patchTeacher(@PathVariable String id, @RequestBody @Valid UpdateTeacherRequest request) {
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

