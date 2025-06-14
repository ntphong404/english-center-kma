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
        if (request instanceof CreateParentRequest) {
            return toParent((CreateParentRequest) request);
        } else if (request instanceof CreateTeacherRequest) {
            return toTeacher((CreateTeacherRequest) request);
        } else if (request instanceof CreateStudentRequest) {
            return toStudent((CreateStudentRequest) request);
        } else if (request instanceof CreateAdminRequest) {
            return toAdmin((CreateAdminRequest) request);
        } else {
            throw new IllegalArgumentException("Unsupported request type");
        }
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
        if (user instanceof Parent) {
            return toParentResponse((Parent) user);
        } else if (user instanceof Teacher) {
            return toTeacherResponse((Teacher) user);
        } else if (user instanceof Student) {
            return toStudentResponse((Student) user);
        } else {
            return toAdminResponse(user);
        }
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

    UserResponse toAdminResponse(User admin);

    UserResponse toParentResponse(Parent parent);

    UserResponse toTeacherResponse(Teacher teacher);

    UserResponse toStudentResponse(Student student);
}
