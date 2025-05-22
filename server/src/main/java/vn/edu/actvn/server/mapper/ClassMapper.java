package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import vn.edu.actvn.server.dto.request.CreateClassRequest;
import vn.edu.actvn.server.dto.response.ClassResponse;
import vn.edu.actvn.server.entity.EntityClass;

@Mapper(componentModel = "spring")
public interface ClassMapper {

    EntityClass toEntityClass(CreateClassRequest request);

    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    ClassResponse toClassResponse(EntityClass entityClass);

    @Named("statusToString")
    default String mapStatusToString(EntityClass.Status status) {
        return status == null ? null : status.name();
    }
}
