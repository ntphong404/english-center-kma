package vn.edu.actvn.server.dto.request.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.actvn.server.entity.Attendance;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendanceResponse {
    String studentId;
    Attendance.Status status;
    String note;
}
