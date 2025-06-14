package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
                .result(parentService.getAllParents(pageable))
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
    public ApiResponse<UserResponse> createParent(@RequestBody CreateParentRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(parentService.createParent(request))
                .message("Parent created successfully")
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update parent information")
    public ApiResponse<UserResponse> updateParent(@PathVariable String id, @RequestBody UpdateParentRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(parentService.updateParent(id, request))
                .message("Parent updated successfully")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update parent information")
    public ApiResponse<UserResponse> patchParent(@PathVariable String id, @RequestBody UpdateParentRequest request) {
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