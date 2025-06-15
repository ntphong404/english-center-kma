package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
                .result(studentService.getAllStudents(pageable))
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

    @PutMapping("/{id}")
    @Operation(summary = "Update student information")
    public ApiResponse<UserResponse> updateStudent(@PathVariable String id, @RequestBody UpdateStudentRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(studentService.updateStudent(id, request))
                .message("Student updated successfully")
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