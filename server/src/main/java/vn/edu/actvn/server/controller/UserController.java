package vn.edu.actvn.server.controller;

import java.util.List;

import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.actvn.server.dto.request.ChangePasswordRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.request.UserCreationRequest;
import vn.edu.actvn.server.dto.request.UserUpdateRequest;
import vn.edu.actvn.server.dto.response.UserResponse;
import vn.edu.actvn.server.service.UserService;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "User API", description = "Endpoints for user management and information")
public class UserController {
    UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user")
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .message("User created successfully")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all users")
    public ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .message("Fetched all users")
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

    @GetMapping("/role/{roleName}")
    @Operation(summary = "Get users by role name")
    public ApiResponse<List<UserResponse>> getUsersByRoleName(@PathVariable String roleName) {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUsersByRole(roleName))
                .message("Fetched users by role")
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
    public ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId, request))
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
}
