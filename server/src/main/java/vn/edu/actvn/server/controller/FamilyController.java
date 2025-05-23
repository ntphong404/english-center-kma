package vn.edu.actvn.server.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.*;

import vn.edu.actvn.server.dto.request.CreateFamilyRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.FamilyResponse;
import vn.edu.actvn.server.service.FamilyService;

@RestController
@RequestMapping("/families")
@Tag(name = "Family API", description = "Endpoints for managing families")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FamilyController {

    FamilyService familyService;

    @GetMapping
    @Operation(summary = "Get all families")
    public ApiResponse<List<FamilyResponse>> getAllFamilies() {
        return ApiResponse.<List<FamilyResponse>>builder()
                .message("Fetched all families")
                .result(familyService.getFamilies())
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a family by ID")
    public ApiResponse<FamilyResponse> getFamilyById(@PathVariable String id) {
        return ApiResponse.<FamilyResponse>builder()
                .message("Fetched family")
                .result(familyService.getFamilyById(id))
                .build();
    }

    @GetMapping("/parent/{parentId}")
    @Operation(summary = "Get families by parent ID")
    public ApiResponse<List<FamilyResponse>> getFamiliesByParentId(@PathVariable String parentId) {
        return ApiResponse.<List<FamilyResponse>>builder()
                .message("Fetched families by parent ID")
                .result(familyService.getFamiliesByParentId(parentId))
                .build();
    }

    @PostMapping
    @Operation(summary = "Create a new family")
    public ApiResponse<FamilyResponse> createFamily(@RequestBody CreateFamilyRequest request) {
        return ApiResponse.<FamilyResponse>builder()
                .message("Family created")
                .result(familyService.createFamily(request))
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a family")
    public ApiResponse<FamilyResponse> updateFamily(@PathVariable String id, @RequestBody CreateFamilyRequest request) {
        return ApiResponse.<FamilyResponse>builder()
                .message("Family updated")
                .result(familyService.updateFamily(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a family by ID")
    public ApiResponse<Void> deleteFamily(@PathVariable String id) {
        familyService.deleteFamily(id);
        return ApiResponse.<Void>builder()
                .message("Family deleted")
                .build();
    }

    @PostMapping("/{id}/students")
    @Operation(summary = "Add students to a family")
    public ApiResponse<FamilyResponse> addStudentsToFamily(@PathVariable String id, @RequestBody List<String> studentIds) {
        return ApiResponse.<FamilyResponse>builder()
                .message("Students added to family")
                .result(familyService.addStudentToFamily(id, studentIds))
                .build();
    }
}
