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
import vn.edu.actvn.server.dto.request.StringIdRequest;
import vn.edu.actvn.server.dto.request.user.CreateParentRequest;
import vn.edu.actvn.server.dto.request.user.UpdateParentRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.service.ParentService;

@RestController
@RequestMapping("/parents")
@RequiredArgsConstructor
@Tag(name = "Parent API", description = "Endpoints for parent management")
public class ParentController {
    private final ParentService parentService;

    @GetMapping
    @Operation(summary = "Get all parents")
    public ApiResponse<Page<UserResponse>> getAllParents(
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
                .result(parentService.getAllParents(fullName,email,pageable))
                .message("Fetched all parents")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get parent by ID")
    public ApiResponse<UserResponse> getParentById(@PathVariable String id) {
        return ApiResponse.<UserResponse>builder()
                .result(parentService.getParentById(id))
                .message("Fetched parent information")
                .build();
    }

    @PostMapping
    @Operation(summary = "Create a new parent")
    public ApiResponse<UserResponse> createParent(@RequestBody @Valid CreateParentRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(parentService.createParent(request))
                .message("Parent created successfully")
                .build();
    }


    @PatchMapping("/{id}")
    @Operation(summary = "Partially update parent information")
    public ApiResponse<UserResponse> patchParent(@PathVariable String id, @RequestBody @Valid UpdateParentRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(parentService.patchParent(id, request))
                .message("Parent partially updated successfully")
                .build();
    }

    @PostMapping("/{parentId}/add-student")
    @Operation(summary = "Add student to parent")
    public ApiResponse<String> addStudentToParent(@PathVariable String parentId, @RequestBody StringIdRequest studentId) {
        parentService.addStudent(parentId, studentId.id());
        return ApiResponse.<String>builder()
                .result("Student has been added to parent")
                .message("Student added successfully")
                .build();
    }

    @PostMapping("/{parentId}/remove-student")
    @Operation(summary = "Remove student from parent")
    public ApiResponse<String> removeStudentFromParent(@PathVariable String parentId, @RequestBody StringIdRequest studentId) {
        parentService.removeStudent(parentId, studentId.id());
        return ApiResponse.<String>builder()
                .result("Student has been removed from parent")
                .message("Student removed successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a parent by ID")
    public ApiResponse<String> deleteParent(@PathVariable String id) {
        parentService.deleteParent(id);
        return ApiResponse.<String>builder()
                .result("Parent has been deleted")
                .message("Parent deleted successfully")
                .build();
    }
}

