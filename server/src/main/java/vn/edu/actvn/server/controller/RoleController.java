package vn.edu.actvn.server.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.*;

import vn.edu.actvn.server.dto.request.role.RoleRequest;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.role.RoleResponse;
import vn.edu.actvn.server.service.RoleService;

@RestController
@RequestMapping("/roles")
@Tag(name = "Role API", description = "Endpoints for managing user roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {

    RoleService roleService;

    @PostMapping
    @Operation(summary = "Create a new role")
    public ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .message("Role created successfully")
                .result(roleService.create(request))
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all roles")
    public ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .message("Fetched all roles")
                .result(roleService.getAll())
                .build();
    }

    @DeleteMapping("/{role}")
    @Operation(summary = "Delete a role by name")
    public ApiResponse<Void> delete(@PathVariable String role) {
        roleService.delete(role);
        return ApiResponse.<Void>builder()
                .message("Role deleted successfully")
                .build();
    }
}
