package vn.edu.actvn.server.dto.response.entityclass;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.dto.response.user.UserResponse;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassResponse {
    String classId;
    String className;

    @Column(nullable = false)
    Integer year;
    @Column(nullable = false)
    Integer grade;

    String status;
    String teacherId;
    List<String> studentIds;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal unitPrice;

    LocalDate startDate;
    LocalDate endDate;

    LocalTime startTime;
    LocalTime endTime;

    List<DayOfWeek> daysOfWeek;
}
