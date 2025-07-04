package vn.edu.actvn.server.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.dto.response.entityclass.ClassResponse;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminDashboardResponse {
    Long totalStudents;
    Long totalTeachers;
    BigDecimal totalTuitionFeesOfMonth;
    BigDecimal totalTuitionFeesUnPaid;
    List<ClassResponse> classesUpcoming;
}
