package vn.edu.actvn.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.upload.UploadResponse;
import vn.edu.actvn.server.service.ImageUploadService;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Upload API", description = "Endpoints for uploaded files")
public class UploadController {

    ImageUploadService imageUploadService;

    @PostMapping(value = "/avatar",consumes = "multipart/form-data")
    @Operation(summary = "Upload an image file")
    public ApiResponse<UploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        UploadResponse uploadResponse = imageUploadService.uploadAvatar(file);
        return ApiResponse.<UploadResponse>builder()
                .result(uploadResponse)
                .message("File uploaded successfully")
                .build();
    }

    @PostMapping(value = "/banner", consumes = "multipart/form-data")
    @Operation(summary = "Upload a banner image file")
    public ApiResponse<UploadResponse> uploadBanner(@RequestParam("file") MultipartFile file) {
        UploadResponse uploadResponse = imageUploadService.uploadBanner(file);
        return ApiResponse.<UploadResponse>builder()
                .result(uploadResponse)
                .message("Banner uploaded successfully")
                .build();
    }
}

