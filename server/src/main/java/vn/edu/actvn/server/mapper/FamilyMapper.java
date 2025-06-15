package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import vn.edu.actvn.server.dto.request.CreateClassRequest;
import vn.edu.actvn.server.dto.request.CreateFamilyRequest;
import vn.edu.actvn.server.dto.response.ClassResponse;
import vn.edu.actvn.server.dto.response.FamilyResponse;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.entity.Family;

@Mapper(componentModel = "spring")
public interface FamilyMapper {

    Family toFamily(CreateFamilyRequest request);

    FamilyResponse toFamilyResponse(Family family);

}
