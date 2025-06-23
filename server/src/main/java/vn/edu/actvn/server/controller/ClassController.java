package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.ListStringIdRequest;
import vn.edu.actvn.server.dto.request.StringIdRequest;
import vn.edu.actvn.server.dto.request.entityclass.ClassUpdateRequest;
import vn.edu.actvn.server.dto.request.entityclass.CreateClassRequest;
import vn.edu.actvn.server.dto.response.entityclass.ClassResponse;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.service.ClassService;

import java.util.List;

@RestController
@RequestMapping("/classes")
@Tag(name = "Class API", description = "Operations related to entityclass management")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ClassController {

    ClassService classService;

    @PostMapping
    @Operation(summary = "Create a new entityclass")
    public ApiResponse<ClassResponse> createClass(@RequestBody CreateClassRequest request) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.createClass(request))
                .message("Class created successfully")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update entityclass information")
    public ApiResponse<ClassResponse> patchClass(
            @PathVariable("id") String classId,
            @RequestBody ClassUpdateRequest request
    ) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.patchClass(classId, request))
                .message("Class updated successfully")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all classes")
    public ApiResponse<Page<ClassResponse>> getAllClasses(
            @RequestParam (required = false) String studentId,
            @RequestParam (required = false) String teacherId,
            @RequestParam (required = false) String className,
            @RequestParam (required = false) Integer grade,
            @ParameterObject Pageable pageable
            ) {
        return ApiResponse.<Page<ClassResponse>>builder()
                .result(classService.getClasses(studentId,teacherId,className,grade,pageable))
                .message("Class list retrieved successfully")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get entityclass details by ID")
    public ApiResponse<ClassResponse> getClassById(@PathVariable("id") String classId) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.getClassById(classId))
                .message("Class details retrieved successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "close a entityclass by ID")
    public ApiResponse<Void> closeClass(@PathVariable("id") String classId) {
        classService.closeClass(classId);
        return ApiResponse.<Void>builder()
                .message("Class deleted successfully")
                .build();
    }

    @PostMapping("/{classId}/students")
    @Operation(summary = "Add students to a class")
    public ApiResponse<ClassResponse> addStudentsToClass(
            @PathVariable("classId") String classId,
            @RequestBody ListStringIdRequest studentIds
    ) {
        return ApiResponse.<ClassResponse>builder()
                .message("Students added to class successfully")
                .result(classService.addStudents(classId, studentIds.ids()))
                .build();
    }

    @DeleteMapping("/{classId}/students")
    @Operation(summary = "Remove students from a class")
    public ApiResponse<ClassResponse> removeStudentsFromClass(
            @PathVariable("classId") String classId,
            @RequestBody StringIdRequest studentId
    ) {
        return ApiResponse.<ClassResponse>builder()
                .message("Students removed from class successfully")
                .result(classService.removeStudents(classId, studentId.id()))
                .build();
    }
}
