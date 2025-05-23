package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.actvn.server.dto.request.AttendanceUpdateRequest;
import vn.edu.actvn.server.dto.request.CreateAttendanceRequest;
import vn.edu.actvn.server.dto.response.AttendanceResponse;
import vn.edu.actvn.server.entity.Attendance;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(source = "entityClass.classId", target = "classId")
    @Mapping(source = "student.userId", target = "studentId")
    AttendanceResponse toAttendanceResponse(Attendance attendance);

    @Mapping(target = "entityClass", ignore = true)
    @Mapping(target = "student", ignore = true)
    Attendance toAttendance(CreateAttendanceRequest createAttendanceRequest);

    Attendance updateAttendance(AttendanceUpdateRequest attendanceUpdateRequest,@MappingTarget Attendance attendance);
}
