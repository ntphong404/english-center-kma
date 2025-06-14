package vn.edu.actvn.server.mapper;

import org.mapstruct.*;

import vn.edu.actvn.server.dto.request.attendance.AttendanceUpdateRequest;
import vn.edu.actvn.server.dto.request.attendance.CreateAttendanceRequest;
import vn.edu.actvn.server.dto.request.attendance.StudentAttendanceResponse;
import vn.edu.actvn.server.dto.response.attendance.AttendanceResponse;
import vn.edu.actvn.server.entity.Attendance;
import vn.edu.actvn.server.entity.StudentAttendance;

import java.util.List;


@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AttendanceMapper {

    @Mapping(source = "entityClass.classId", target = "classId")
    AttendanceResponse toAttendanceResponse(Attendance attendance);

    StudentAttendanceResponse toDTO(StudentAttendance studentAttendance);

    List<StudentAttendanceResponse> toDTOList(List<StudentAttendance> list);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partiallyUpdateAttendance(@MappingTarget Attendance attendance, AttendanceUpdateRequest request);
}