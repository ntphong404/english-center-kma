package vn.edu.actvn.server.dto.request.role;

import vn.edu.actvn.server.constant.Permission;

import java.util.Set;

public record PermissionRequest(Set<Permission> permissions) {
}
