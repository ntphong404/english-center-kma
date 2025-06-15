package vn.edu.actvn.server.dto.response.attendance;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.dto.request.attendance.StudentAttendanceResponse;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttendanceResponse {
    String attendanceId;
    String classId;
    LocalDate date;
    List<StudentAttendanceResponse> studentAttendances;
}
