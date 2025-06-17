package vn.edu.actvn.server.service;

import java.util.List;
import java.util.Set;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.actvn.server.constant.Permission;
import vn.edu.actvn.server.dto.request.role.RoleRequest;
import vn.edu.actvn.server.dto.response.role.RoleResponse;
import vn.edu.actvn.server.entity.Role;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.RoleMapper;
import vn.edu.actvn.server.repository.RoleRepository;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;

    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public RoleResponse create(RoleRequest request) {
        var role = roleMapper.toRole(request);
        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream().map(roleMapper::toRoleResponse).toList();
    }

    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public void delete(String role) {
        roleRepository.deleteById(role);
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleResponse addPermission(String roleName, Set<Permission> permissions) {
        Role role = roleRepository.findById(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // Add new permissions
        if (role.getPermissions() == null) {
            role.setPermissions(permissions);
        } else {
            role.getPermissions().addAll(permissions);
        }

        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleResponse updatePermissions(String roleName, Set<Permission> permissions) {
        Role role = roleRepository.findById(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // Replace all permissions
        role.setPermissions(permissions);

        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }
}
