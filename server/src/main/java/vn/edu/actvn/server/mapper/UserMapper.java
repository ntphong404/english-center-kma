package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import vn.edu.actvn.server.dto.request.UserCreationRequest;
import vn.edu.actvn.server.dto.request.UserUpdateRequest;
import vn.edu.actvn.server.dto.response.UserResponse;
import vn.edu.actvn.server.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
