package vn.edu.actvn.server.dto.request.tuitionfee;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTuitionFeeRequest {
    String studentId;
    String classId;
    LocalDate yearMonth; // 2025-06
}
