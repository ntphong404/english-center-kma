package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.ListStringIdRequest;
import vn.edu.actvn.server.dto.request.user.CreateStudentRequest;
import vn.edu.actvn.server.dto.request.user.UpdateStudentRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.service.StudentService;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Tag(name = "Student API", description = "Endpoints for student management")
public class StudentController {
    private final StudentService studentService;

    @GetMapping
    @Operation(summary = "Get all students")
    public ApiResponse<Page<UserResponse>> getAllStudents(
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
                .result(studentService.getAllStudents(fullName, email,pageable))
                .message("Fetched all students")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID")
    public ApiResponse<UserResponse> getStudentById(@PathVariable String id) {
        return ApiResponse.<UserResponse>builder()
                .result(studentService.getStudentById(id))
                .message("Fetched student information")
                .build();
    }

    @PostMapping("/studentIds")
    @Operation(summary = "Get students by a list of IDs")
    public ApiResponse<List<UserResponse>> getStudentsByIds(@RequestBody ListStringIdRequest studentIds) {
        return ApiResponse.<List<UserResponse>>builder()
                .result(studentService.getStudentsByIds(studentIds.ids()))
                .message("Fetched students by IDs")
                .build();
    }

    @PostMapping
    @Operation(summary = "Create a new student")
    public ApiResponse<UserResponse> createStudent(@RequestBody CreateStudentRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(studentService.createStudent(request))
                .message("Student created successfully")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update student information")
    public ApiResponse<UserResponse> patchStudent(@PathVariable String id, @RequestBody UpdateStudentRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(studentService.patchStudent(id, request))
                .message("Student partially updated successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a student by ID")
    public ApiResponse<String> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ApiResponse.<String>builder()
                .result("Student has been deleted")
                .message("Student deleted successfully")
                .build();
    }

}

