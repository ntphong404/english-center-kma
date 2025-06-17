package vn.edu.actvn.server.mapper;

import org.mapstruct.*;

import vn.edu.actvn.server.dto.request.user.*;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.entity.Parent;
import vn.edu.actvn.server.entity.Teacher;
import vn.edu.actvn.server.entity.Student;

@Mapper(componentModel = "spring")
public interface UserMapper {

    default User toUser(Object request) {
            return toAdmin((CreateAdminRequest) request);
    }

    @Mapping(target = "role", ignore = true)
    User toAdmin(CreateAdminRequest request);

    @Mapping(target = "role", ignore = true)
    Parent toParent(CreateParentRequest request);

    @Mapping(target = "role", ignore = true)
    Teacher toTeacher(CreateTeacherRequest request);

    @Mapping(target = "role", ignore = true)
    Student toStudent(CreateStudentRequest request);

    default UserResponse toUserResponse(User user) {
            return toAdminResponse(user);
    }

    void updateAdmin(@MappingTarget User user, UpdateAdminRequest request);

    void updateStudent(@MappingTarget Student student, UpdateStudentRequest request);

    void updateTeacher(@MappingTarget Teacher teacher, UpdateTeacherRequest request);

    void updateParent(@MappingTarget Parent parent, UpdateParentRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patchStudent(@MappingTarget Student student, UpdateStudentRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patchTeacher(@MappingTarget Teacher teacher, UpdateTeacherRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patchParent(@MappingTarget Parent parent, UpdateParentRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patchAdmin(@MappingTarget User user, UpdateAdminRequest request);

    @Mapping(target = "role", source = "role.name")
    UserResponse toAdminResponse(User admin);

    @Mapping(target = "role", source = "role.name")
    UserResponse toParentResponse(Parent parent);

    @Mapping(target = "role", source = "role.name")
    UserResponse toTeacherResponse(Teacher teacher);

    @Mapping(target = "role", source = "role.name")
    UserResponse toStudentResponse(Student student);
}
