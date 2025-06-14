package vn.edu.actvn.server.dto.request.tuitionfee;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTuitionFeeRequest {
    String studentId;
    String classId;
    LocalDate yearMonth; // 2025-06
    BigDecimal amount; // 1.000.000
    BigDecimal remainingAmount; // 500.000
}
