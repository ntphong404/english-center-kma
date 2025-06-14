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
import vn.edu.actvn.server.service.ImageUploadService;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "User API", description = "Endpoints for user management and information")
public class UploadController {

    ImageUploadService imageUploadService;

    @PostMapping
    @Operation(summary = "Upload an image file")
    public ApiResponse<String> upload(@RequestParam("file") MultipartFile file) {
        String url = imageUploadService.upload(file);
        return ApiResponse.<String>builder()
                .result(url)
                .message("File uploaded successfully")
                .build();
    }
}

