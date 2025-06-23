package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.actvn.server.dto.request.banner.CreateBannerCourseRequest;
import vn.edu.actvn.server.dto.request.banner.UpdateBannerCourseRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.banner.BannerCourseResponse;
import vn.edu.actvn.server.dto.response.upload.UploadResponse;
import vn.edu.actvn.server.service.BannerCourseService;
import vn.edu.actvn.server.service.ImageUploadService;

import java.util.List;

@RestController
@RequestMapping("/banner-courses")
@RequiredArgsConstructor
@Tag(name = "BannerCourse API", description = "Endpoints for banner course management")
public class BannerCourseController {
    private final BannerCourseService bannerCourseService;
    private final ImageUploadService imageUploadService;

    @GetMapping("/all")
    @Operation(summary = "Get all banner courses")
    public ApiResponse<List<BannerCourseResponse>> getAllBannerCourses() {
        return ApiResponse.<List<BannerCourseResponse>>builder()
                .result(bannerCourseService.getAllBannerCourses())
                .message("Fetched all banner courses")
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get banner course by ID")
    public ApiResponse<BannerCourseResponse> getBannerCourseById(@PathVariable String id) {
        return ApiResponse.<BannerCourseResponse>builder()
                .result(bannerCourseService.getBannerCourseById(id))
                .message("Fetched banner course information")
                .build();
    }

    @PostMapping(consumes = "multipart/form-data")
    @Operation(summary = "Create a new banner course")
    public ApiResponse<BannerCourseResponse> createBannerCourse(
            @ModelAttribute CreateBannerCourseRequest request,
            @RequestParam("image") MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            UploadResponse uploadResponse = imageUploadService.uploadBanner(image);
            request.setImageUrl(uploadResponse.getUrl());
            request.setPublicId(uploadResponse.getPublicId());
        }
        return ApiResponse.<BannerCourseResponse>builder()
                .result(bannerCourseService.createBannerCourse(request))
                .message("Banner course created successfully")
                .build();
    }

    @PatchMapping(path = "/{id}", consumes = "multipart/form-data")
    @Operation(summary = "Partially update banner course information")
    public ApiResponse<BannerCourseResponse> patchBannerCourse(
            @PathVariable String id,
            @ModelAttribute UpdateBannerCourseRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            UploadResponse uploadResponse = imageUploadService.uploadBanner(image);
            request.setImageUrl(uploadResponse.getUrl());
            request.setPublicId(uploadResponse.getPublicId());
        }
        return ApiResponse.<BannerCourseResponse>builder()
                .result(bannerCourseService.patchBannerCourse(id, request))
                .message("Banner course partially updated successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a banner course by ID")
    public ApiResponse<String> deleteBannerCourse(@PathVariable String id) {
        bannerCourseService.deleteBannerCourse(id);
        return ApiResponse.<String>builder()
                .result("Banner course has been deleted")
                .message("Banner course deleted successfully")
                .build();
    }

    @GetMapping
    @Operation(summary = "get all banner courses")
    public ApiResponse<Page<BannerCourseResponse>> searchBannerCourses(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @ParameterObject Pageable pageable
            ) {
        return ApiResponse.<Page<BannerCourseResponse>>builder()
                .result(bannerCourseService.searchBannerCourses(title, description, pageable))
                .message("Banner courses searched successfully")
                .build();
    }
}

