package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.payment.CreatePaymentRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.payment.PaymentResponse;
import vn.edu.actvn.server.service.PaymentService;

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
    public ApiResponse<Page<PaymentResponse>> getAllPayments(
            @RequestParam (required = false) String studentId,
            @RequestParam (required = false) String classId,
            @ParameterObject Pageable pageable
    ) {
        return ApiResponse.<Page<PaymentResponse>>builder()
                .result(paymentService.getAllPayments(studentId, classId, pageable))
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
}

