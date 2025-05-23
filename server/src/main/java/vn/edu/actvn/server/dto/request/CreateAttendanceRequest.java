package vn.edu.actvn.server.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAttendanceRequest {
    String classId;
    String studentId;
    LocalDate date;
    String status;
    String notes;
}
