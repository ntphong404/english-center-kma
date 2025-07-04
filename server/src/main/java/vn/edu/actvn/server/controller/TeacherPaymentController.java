package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.teacherpayment.CreateTeacherPaymentRequest;
import vn.edu.actvn.server.dto.request.teacherpayment.UpdateTeacherPaymentRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.teacherpayment.TeacherPaymentResponse;
import vn.edu.actvn.server.service.TeacherPaymentService;

@RestController
@RequestMapping("/teacher-payments")
@RequiredArgsConstructor
@Tag(name = "Teacher Payment", description = "Manage teacher payments")
public class TeacherPaymentController {
    private final TeacherPaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get all teacher payments")
    public ApiResponse<Page<TeacherPaymentResponse>> getAll(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @ParameterObject Pageable pageable) {
        return ApiResponse.<Page<TeacherPaymentResponse>>builder()
                .result(paymentService.getAll(teacherId, month, year, pageable))
                .message("Fetched all teacher payments")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ApiResponse<TeacherPaymentResponse> getById(@PathVariable String id) {
        return ApiResponse.<TeacherPaymentResponse>builder()
                .result(paymentService.getById(id))
                .message("Fetched teacher payment")
                .build();
    }

    @GetMapping("/salary")
    @Operation(summary = "Get payment by ID")
    public ApiResponse<Page<TeacherPaymentResponse>> getSalary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @ParameterObject Pageable pageable) {
        return ApiResponse.<Page<TeacherPaymentResponse>>builder()
                .result(paymentService.getByTeacher(month, year ,pageable))
                .message("Fetched teacher payment")
                .build();
    }

    @PostMapping
    @Operation(summary = "Create a new teacher payment")
    public ApiResponse<TeacherPaymentResponse> create(@RequestBody CreateTeacherPaymentRequest req) {
        return ApiResponse.<TeacherPaymentResponse>builder()
                .result(paymentService.create(req))
                .message("Created teacher payment")
                .build();
    }

    @PutMapping("/{id}/pay")
    @Operation(summary = "Update payment status (partial/full payment)")
    public ApiResponse<TeacherPaymentResponse> updatePaid(@PathVariable String id, @RequestBody UpdateTeacherPaymentRequest req) {
        return ApiResponse.<TeacherPaymentResponse>builder()
                .result(paymentService.updatePaid(id, req))
                .message("Updated payment (partial/full)")
                .build();
    }
}

