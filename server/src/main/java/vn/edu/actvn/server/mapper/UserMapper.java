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
    @Mapping(target = "gender", expression = "java(request.getGender() != null ? request.getGender().toUpperCase() : null)")    User toAdmin(CreateAdminRequest request);

    @Mapping(target = "role", ignore = true)
    @Mapping(target = "gender", expression = "java(request.getGender() != null ? request.getGender().toUpperCase() : null)")    Parent toParent(CreateParentRequest request);

    @Mapping(target = "role", ignore = true)
    @Mapping(target = "gender", expression = "java(request.getGender() != null ? request.getGender().toUpperCase() : null)")    Teacher toTeacher(CreateTeacherRequest request);

    @Mapping(target = "role", ignore = true)
    @Mapping(target = "gender", expression = "java(request.getGender() != null ? request.getGender().toUpperCase() : null)")    Student toStudent(CreateStudentRequest request);

    default UserResponse toUserResponse(User user) {
        return switch (user) {
            case Parent parent -> toParentResponse(parent);
            case Teacher teacher -> toTeacherResponse(teacher);
            case Student student -> toStudentResponse(student);
            case null, default -> toAdminResponse(user);
        };
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
