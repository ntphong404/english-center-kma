package vn.edu.actvn.server.dto.response.tuitionfee;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    String tuitionFeeId;
    String studentId;
    String classId;
    @JsonFormat(pattern = "yyyy-MM")
    YearMonth yearMonth; // 2025-06
    BigDecimal amount; // 1.000.000
    Integer discount;
    BigDecimal remainingAmount; // 500.000
}
