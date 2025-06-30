package vn.edu.actvn.server.dto.request.teacherpayment;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateTeacherPaymentRequest {
    private String teacherId;
    private int month;
    private int year;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String note;
}

