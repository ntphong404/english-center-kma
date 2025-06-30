package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.edu.actvn.server.dto.response.teacherpayment.TeacherPaymentResponse;
import vn.edu.actvn.server.entity.TeacherPayment;

@Mapper(componentModel = "spring")
public interface TeacherPaymentMapper {

    @Mapping(target = "teacherId", source = "teacher.userId")
    @Mapping(target = "teacherName", source = "teacher.fullName")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "remainingAmount", source = "remainingAmount")
    TeacherPaymentResponse toResponse(TeacherPayment payment);

}

