package vn.edu.actvn.server.dto.request.teacherpayment;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateTeacherPaymentRequest {
    private BigDecimal paidAmount;
    private LocalDate paidDate;
    private String note;
}

