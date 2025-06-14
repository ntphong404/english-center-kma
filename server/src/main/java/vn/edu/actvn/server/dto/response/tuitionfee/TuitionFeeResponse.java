package vn.edu.actvn.server.dto.response.tuitionfee;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.YearMonth;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TuitionFeeResponse {
    String studentId;
    String classId;
    YearMonth yearMonth; // 2025-06
    BigDecimal amount; // 1.000.000
    BigDecimal remainingAmount; // 500.000
}
