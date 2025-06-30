package vn.edu.actvn.server.dto.response.teacherpayment;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TeacherPaymentResponse {
    private String id;
    private String teacherId;
    private String teacherName;
    private int month;
    private int year;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private LocalDateTime createdAt;
    private String note;
    private String status;
}

