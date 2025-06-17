package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import vn.edu.actvn.server.dto.request.tuitionfee.CreateTuitionFeeRequest;
import vn.edu.actvn.server.dto.request.tuitionfee.UpdateTuitionFeeRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.tuitionfee.TuitionFeeResponse;
import vn.edu.actvn.server.service.TuitionFeeService;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/tuition-fees")
@RequiredArgsConstructor
@Tag(name = "Tuition Fee API", description = "Endpoints for tuition fee management")
public class TuitionFeeController {

    private final TuitionFeeService tuitionFeeService;

    @PostMapping
    @Operation(summary = "Create tuition fee", description = "Create a new tuition fee record")
    public ApiResponse<TuitionFeeResponse> create(@RequestBody CreateTuitionFeeRequest request) {
        return ApiResponse.<TuitionFeeResponse>builder()
                .result(tuitionFeeService.createTuitionFee(request))
                .message("Tuition fee created")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all tuition fees", description = "Return paginated tuition fee list")
    public ApiResponse<Page<TuitionFeeResponse>>  getAll(
            @ParameterObject @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "yearMonth",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        return ApiResponse.<Page<TuitionFeeResponse>>builder()
                .result(tuitionFeeService.getAllTuitionFees(pageable))
                .message("Fetched all tuition fees")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tuition fee by ID", description = "Return tuition fee by ID")
    public ApiResponse<TuitionFeeResponse> getById(@PathVariable String id) {
        return ApiResponse.<TuitionFeeResponse>builder()
                .result(tuitionFeeService.getTuitionFeeById(id))
                .message("Fetched tuition fee")
                .build();
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get tuition fees by student", description = "Return all tuition fees for a student")
    public ApiResponse<Page<TuitionFeeResponse>> getByStudent(
            @PathVariable String studentId,
            @ParameterObject @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "yearMonth",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        return ApiResponse.<Page<TuitionFeeResponse>>builder()
                .result(tuitionFeeService.getTuitionFeesByStudentId(pageable,studentId))
                .message("Fetched tuition fees for student")
                .build();
    }

    @GetMapping("/student/{studentId}/month")
    @Operation(summary = "Get tuition fee by student and month", description = "Return tuition fee for a student in a month")
    public ApiResponse<TuitionFeeResponse> getByStudentAndMonth(@PathVariable String studentId, @RequestParam LocalDate yearMonth) {
        return ApiResponse.<TuitionFeeResponse>builder()
                .result(tuitionFeeService.getTuitionFeeByStudentIdAndYearMonth(studentId, yearMonth))
                .message("Fetched tuition fee by student and month")
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update tuition fee", description = "Fully update tuition fee by ID")
    public ApiResponse<TuitionFeeResponse> update(@PathVariable String id, @RequestBody UpdateTuitionFeeRequest request) {
        return ApiResponse.<TuitionFeeResponse>builder()
                .result(tuitionFeeService.updateTuitionFee(id, request))
                .message("Tuition fee updated")
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update tuition fee", description = "Partially update tuition fee by ID")
    public ApiResponse<TuitionFeeResponse> partialUpdate(@PathVariable String id, @RequestBody UpdateTuitionFeeRequest request) {
        return ApiResponse.<TuitionFeeResponse>builder()
                .result(tuitionFeeService.partialUpdateTuitionFee(id, request))
                .message("Tuition fee partially updated")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tuition fee", description = "Delete tuition fee by ID")
    public ApiResponse<Void> delete(@PathVariable String id) {
        tuitionFeeService.deleteTuitionFee(id);
        return ApiResponse.<Void>builder()
                .message("Tuition fee deleted")
                .build();
    }
}
