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

    @PutMapping("/{id}")
    @Operation(summary = "Update entityclass information")
    public ApiResponse<ClassResponse> updateClass(
            @PathVariable("id") String classId,
            @RequestBody ClassUpdateRequest request
    ) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.updateClass(classId, request))
                .message("Class updated successfully")
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
            @ParameterObject @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "teacher.userId",
                    direction = Sort.Direction.ASC
            ) Pageable pageable
            ) {
        return ApiResponse.<Page<ClassResponse>>builder()
                .result(classService.getClasses(pageable))
                .message("Class list retrieved successfully")
                .build();
    }

    @GetMapping("/teacher/{teacherId}")
    @Operation(summary = "Get classes by teacher ID")
    public ApiResponse<Page<ClassResponse>> getClassesByTeacher(
            @PathVariable String teacherId,
            @ParameterObject @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "grade",
                    direction = Sort.Direction.ASC //grade,asc
            ) Pageable pageable
    ) {
        return ApiResponse.<Page<ClassResponse>>builder()
                .result(classService.getClassesByTeacherId(teacherId,pageable))
                .message("Classes retrieved successfully")
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
    @Operation(summary = "Delete a entityclass by ID")
    public ApiResponse<Void> deleteClass(@PathVariable("id") String classId) {
        classService.deleteClass(classId);
        return ApiResponse.<Void>builder()
                .message("Class deleted successfully")
                .build();
    }

    @PostMapping("/{classId}/students")
    @Operation(summary = "Add students to a class")
    public ApiResponse<Void> addStudentsToClass(
            @PathVariable("classId") String classId,
            @RequestBody ListStringIdRequest studentIds
    ) {
        classService.addStudents(classId, studentIds.ids());
        return ApiResponse.<Void>builder()
                .message("Students added to class successfully")
                .build();
    }

    @DeleteMapping("/{classId}/students")
    @Operation(summary = "Remove students from a class")
    public ApiResponse<Void> removeStudentsFromClass(
            @PathVariable("classId") String classId,
            @RequestBody StringIdRequest studentId
    ) {
        classService.removeStudents(classId, studentId.id());
        return ApiResponse.<Void>builder()
                .message("Students removed from class successfully")
                .build();
    }
}
