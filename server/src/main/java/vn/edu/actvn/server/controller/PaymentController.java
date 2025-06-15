package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.attendance.AttendanceUpdateRequest;
import vn.edu.actvn.server.dto.request.payment.CreatePaymentRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.attendance.AttendanceResponse;
import vn.edu.actvn.server.dto.response.payment.PaymentResponse;
import vn.edu.actvn.server.service.AttendanceService;
import vn.edu.actvn.server.service.PaymentService;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payment API", description = "Endpoints for managing payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Create a new payment")
    public ApiResponse<PaymentResponse> createPayment(@RequestBody CreatePaymentRequest request) {
        PaymentResponse result = paymentService.createPayment(request);
        return ApiResponse.<PaymentResponse>builder()
                .result(result)
                .message("Payment created successfully")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all payments")
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> result = paymentService.getAllPayments();
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(result)
                .message("List of payments")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a payment by ID")
    public ApiResponse<PaymentResponse> getPaymentById(@PathVariable String id) {
        PaymentResponse result = paymentService.getPaymentById(id);
        return ApiResponse.<PaymentResponse>builder()
                .result(result)
                .message("Payment found")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a payment by ID")
    public ApiResponse<PaymentResponse> updatePayment(@PathVariable String id,
                                                      @RequestBody CreatePaymentRequest request) {
        PaymentResponse result = paymentService.updatePayment(id, request);
        return ApiResponse.<PaymentResponse>builder()
                .result(result)
                .message("Payment updated")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a payment by ID")
    public ApiResponse<Void> deletePayment(@PathVariable String id) {
        paymentService.deletePayment(id);
        return ApiResponse.<Void>builder()
                .message("Payment deleted")
                .build();
    }


    @GetMapping("/student/{studentId}/class/{classId}")
    @Operation(summary = "Get all payments by student ID and class ID")
    public ApiResponse<List<PaymentResponse>> getPaymentsByStudentIdAndClassId(
            @PathVariable String studentId,
            @PathVariable String classId) {
        List<PaymentResponse> result = paymentService.getPaymentsByStudentIdAndClassId(studentId, classId);
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(result)
                .message("List of payments for student in class")
                .build();
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get payments by student ID")
    public ApiResponse<Page<PaymentResponse>> getPagedPaymentsByStudentId(
            @PathVariable String studentId,
            @ParameterObject
            @PageableDefault(
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        Page<PaymentResponse> result = paymentService.getPagedPaymentsByStudentId(studentId, pageable);
        return ApiResponse.<Page<PaymentResponse>>builder()
                .result(result)
                .message("Paginated list of payments for student")
                .build();
    }
}

