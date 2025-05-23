package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.ClassUpdateRequest;
import vn.edu.actvn.server.dto.request.CreateClassRequest;
import vn.edu.actvn.server.dto.response.ClassResponse;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.service.ClassService;

import java.util.List;

@RestController
@RequestMapping("/classes")
@Tag(name = "Class API", description = "Operations related to class management")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ClassController {

    ClassService classService;

    @PostMapping
    @Operation(summary = "Create a new class")
    public ApiResponse<ClassResponse> createClass(@RequestBody CreateClassRequest request) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.createClass(request))
                .message("Class created successfully")
                .build();
    }

    @PostMapping("/{classId}/students")
    @Operation(summary = "Add students to a class")
    public ApiResponse<ClassResponse> addStudents(
            @PathVariable("classId") String classId,
            @RequestBody List<String> studentIds
    ) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.addStudents(classId, studentIds))
                .message("Students added successfully")
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update class information")
    public ApiResponse<ClassResponse> updateClass(
            @PathVariable("id") String classId,
            @RequestBody ClassUpdateRequest request
    ) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.updateClass(classId, request))
                .message("Class updated successfully")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all classes")
    public ApiResponse<List<ClassResponse>> getAllClasses() {
        return ApiResponse.<List<ClassResponse>>builder()
                .result(classService.getClasses())
                .message("Class list retrieved successfully")
                .build();
    }

    @GetMapping("/teacher/{teacherId}")
    @Operation(summary = "Get classes by teacher ID")
    public ApiResponse<List<ClassResponse>> getClassesByTeacher(@PathVariable String teacherId) {
        return ApiResponse.<List<ClassResponse>>builder()
                .result(classService.getClassesByTeacherId(teacherId))
                .message("Classes retrieved successfully")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get class details by ID")
    public ApiResponse<ClassResponse> getClassById(@PathVariable("id") String classId) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.getClassById(classId))
                .message("Class details retrieved successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a class by ID")
    public ApiResponse<Void> deleteClass(@PathVariable("id") String classId) {
        classService.deleteClass(classId);
        return ApiResponse.<Void>builder()
                .message("Class deleted successfully")
                .build();
    }
}
