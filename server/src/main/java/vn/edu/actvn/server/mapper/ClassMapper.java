package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import vn.edu.actvn.server.dto.request.ClassUpdateRequest;
import vn.edu.actvn.server.dto.request.CreateClassRequest;
import vn.edu.actvn.server.dto.response.ClassResponse;
import vn.edu.actvn.server.entity.EntityClass;

@Mapper(componentModel = "spring")
public interface ClassMapper {

    EntityClass toEntityClass(CreateClassRequest request);

    ClassResponse toClassResponse(EntityClass entityClass);

    EntityClass updateEntityClass(ClassUpdateRequest request, @MappingTarget EntityClass entityClass);
}
