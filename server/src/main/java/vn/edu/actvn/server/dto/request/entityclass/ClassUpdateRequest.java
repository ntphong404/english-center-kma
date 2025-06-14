package vn.edu.actvn.server.dto.request.entityclass;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassUpdateRequest {
    String className;
    Integer year;
    Integer Grade;
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
