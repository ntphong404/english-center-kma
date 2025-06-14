package vn.edu.actvn.server.mapper;

import org.mapstruct.*;
import vn.edu.actvn.server.dto.request.entityclass.ClassUpdateRequest;
import vn.edu.actvn.server.dto.request.entityclass.CreateClassRequest;
import vn.edu.actvn.server.dto.response.entityclass.ClassResponse;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.entity.Student;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ClassMapper {

    EntityClass toEntityClass(CreateClassRequest request);

    @Mapping(source = "teacher.userId", target = "teacherId")
    @Mapping(target = "studentIds", expression = "java(mapStudentIds(entityClass.getStudents()))")
    ClassResponse toClassResponse(EntityClass entityClass);

    void updateEntityClass(ClassUpdateRequest request, @MappingTarget EntityClass entityClass);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patchEntityClass(ClassUpdateRequest request, @MappingTarget EntityClass entityClass);

    default List<String> mapStudentIds(List<Student> students) {
        if (students == null) return null;
        return students.stream()
                .map(Student::getUserId)
                .collect(Collectors.toList());
    }
}
