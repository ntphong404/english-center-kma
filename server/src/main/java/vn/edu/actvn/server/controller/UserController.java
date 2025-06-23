package vn.edu.actvn.server.controller;

import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.actvn.server.dto.request.user.CreateAdminRequest;
import vn.edu.actvn.server.dto.request.user.UpdateAdminRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.upload.UploadResponse;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.dto.request.user.ChangePasswordRequest;
import vn.edu.actvn.server.service.ImageUploadService;
import vn.edu.actvn.server.service.UserService;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "User API", description = "Endpoints for user management and information")
public class UserController {
        UserService userService;
        private final ImageUploadService imageUploadService;

        @PostMapping
        @Operation(summary = "Create a new user")
        public ApiResponse<UserResponse> createUser(@RequestBody @Valid CreateAdminRequest request) {
                return ApiResponse.<UserResponse>builder()
                                .result(userService.createUser(request))
                                .message("User created successfully")
                                .build();
        }

        @GetMapping
        @Operation(summary = "Get all users")
        public ApiResponse<Page<UserResponse>> getUsers(
                        @RequestParam(value = "page", defaultValue = "0") int page,
                        @RequestParam(value = "size", defaultValue = "10") int size,
                        @RequestParam(value = "sort", defaultValue = "username,asc") String sort) {
                Sort pageSort;
                String[] sortPart = sort.split(",");
                String direction = sortPart.length > 1 ? sortPart[1] : "asc";
                String sortField = sortPart[0].trim();
                Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
                String actualSortField = "fullName".equalsIgnoreCase(sortField) ? "lastName" : sortField;

                pageSort = Sort.by(sortDirection, actualSortField);

                Pageable pageable = PageRequest.of(page, size, pageSort);
                return ApiResponse.<Page<UserResponse>>builder()
                                .result(userService.getUsers(pageable))
                                .message("Fetched all users")
                                .build();
        }

        @GetMapping("/role/{roleName}")
        @Operation(summary = "Get all users by role name")
        public ApiResponse<Page<UserResponse>> getUsersByRoleName(
                        @PathVariable String roleName,
                        @RequestParam(value = "page", defaultValue = "0") int page,
                        @RequestParam(value = "size", defaultValue = "10") int size,
                        @RequestParam(value = "sort", defaultValue = "username,asc") String sort) {
                Sort pageSort;
                String[] sortPart = sort.split(",");
                String direction = sortPart.length > 1 ? sortPart[1] : "asc";
                String sortField = sortPart[0].trim();
                Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
                String actualSortField = "fullName".equalsIgnoreCase(sortField) ? "lastName" : sortField;

                pageSort = Sort.by(sortDirection, actualSortField);

                Pageable pageable = PageRequest.of(page, size, pageSort);
                return ApiResponse.<Page<UserResponse>>builder()
                                .result(userService.getUsersByRole(roleName, pageable))
                                .message("Fetched all users by role name")
                                .build();
        }

        @GetMapping("/{userId}")
        @Operation(summary = "Get user by ID")
        public ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
                return ApiResponse.<UserResponse>builder()
                                .result(userService.getUser(userId))
                                .message("Fetched user information")
                                .build();
        }

        @GetMapping("/me")
        @Operation(summary = "Get current logged-in user's information")
        public ApiResponse<UserResponse> getMyInfo() {
                return ApiResponse.<UserResponse>builder()
                                .result(userService.getMyInfo())
                                .message("Fetched current user info")
                                .build();
        }

        @DeleteMapping("/{userId}")
        @Operation(summary = "Delete a user by ID")
        public ApiResponse<String> deleteUser(@PathVariable String userId) {
                userService.deleteUser(userId);
                return ApiResponse.<String>builder()
                                .result("User has been deleted")
                                .message("User deleted successfully")
                                .build();
        }

        @PutMapping("/{userId}")
        @Operation(summary = "Update user information")
        public ApiResponse<UserResponse> updateUser(@PathVariable String userId,
                        @RequestBody UpdateAdminRequest request) {
                return ApiResponse.<UserResponse>builder()
                                .result(userService.updateUser(userId, request))
                                .message("User updated successfully")
                                .build();
        }

        @PatchMapping("/{userId}")
        @Operation(summary = "Update user information")
        public ApiResponse<UserResponse> patchUser(@PathVariable String userId,
                        @RequestBody UpdateAdminRequest request) {
                return ApiResponse.<UserResponse>builder()
                                .result(userService.patchUser(userId, request))
                                .message("User updated successfully")
                                .build();
        }

        @PostMapping("/change-password")
        @Operation(summary = "Change current user's password")
        public ApiResponse<String> changePassword(@RequestBody ChangePasswordRequest request) {
                userService.changePassword(request);
                return ApiResponse.<String>builder()
                                .result("Password has been changed")
                                .message("Password change successful")
                                .build();
        }

        @PostMapping(value = "/change-avatar",consumes = "multipart/form-data")
        @Operation(summary = "Change current user's avatar")
        public ApiResponse<UserResponse> changeAvatar(
                @RequestParam MultipartFile image
        ) {
                String avatarUrl = "";
                String publicId = "";
                if (image != null && !image.isEmpty()) {
                        UploadResponse uploadResponse = imageUploadService.uploadAvatar(image);
                        avatarUrl = uploadResponse.getUrl();
                        publicId = uploadResponse.getPublicId();
                }
                return ApiResponse.<UserResponse>builder()
                                .result(userService.changeAvatar(avatarUrl,publicId))
                                .message("Avatar change successful")
                                .build();
        }
}
