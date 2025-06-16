package vn.edu.actvn.server.dto.request.entityclass;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
public class CreateClassRequest {
    String className;
    Integer year;
    Integer Grade;
    String roomName;
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
