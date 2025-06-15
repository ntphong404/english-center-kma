package vn.edu.actvn.server.dto.request.attendance;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.entity.StudentAttendance;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttendanceUpdateRequest {
    LocalDate date;
    List<StudentAttendance> studentAttendances;
}
