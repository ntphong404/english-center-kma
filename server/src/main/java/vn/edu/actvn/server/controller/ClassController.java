package vn.edu.actvn.server.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.actvn.server.dto.request.CreateClassRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.ClassResponse;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.service.ClassService;

@RestController
@RequestMapping("/classes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ClassController {

    ClassService classService;

    @PostMapping
    public ApiResponse<ClassResponse> createClass(@RequestBody CreateClassRequest request) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.createClass(request))
                .message("Tạo lớp thành công")
                .build();
    }

    @PostMapping("/{classId}/students")
    public ApiResponse<ClassResponse> addStudents(
            @PathVariable("classId") String classId,
            @RequestBody List<String> studentIds
    ) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.addStudents(classId, studentIds))
                .message("Thêm sinh viên vào lớp thành công")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ClassResponse> updateClass(
            @PathVariable("id") String classId,
            @RequestBody CreateClassRequest request
    ) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.updateClass(classId, request))
                .message("Cập nhật lớp thành công")
                .build();
    }

    @GetMapping
    public ApiResponse<List<ClassResponse>> getAllClasses() {
        return ApiResponse.<List<ClassResponse>>builder()
                .result(classService.getClasses())
                .message("Lấy danh sách lớp thành công")
                .build();
    }

    @GetMapping("/teacher/{teacherId}")
    public ApiResponse<List<ClassResponse>> getClassesByTeacher(@PathVariable String teacherId) {
        return ApiResponse.<List<ClassResponse>>builder()
                .result(classService.getClassesByTeacherId(teacherId))
                .message("Lấy danh sách lớp theo giáo viên thành công")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ClassResponse> getClassById(@PathVariable("id") String classId) {
        return ApiResponse.<ClassResponse>builder()
                .result(classService.getClassById(classId))
                .message("Lấy thông tin lớp thành công")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteClass(@PathVariable("id") String classId) {
        classService.deleteClass(classId);
        return ApiResponse.<Void>builder()
                .message("Đã đóng lớp thành công")
                .build();
    }
}
