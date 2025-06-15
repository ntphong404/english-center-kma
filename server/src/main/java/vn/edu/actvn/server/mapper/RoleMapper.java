package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;

import vn.edu.actvn.server.dto.request.role.RoleRequest;
import vn.edu.actvn.server.dto.response.role.RoleResponse;
import vn.edu.actvn.server.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
