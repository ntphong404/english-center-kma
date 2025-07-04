package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "tuition_fees")
public class TuitionFee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String tuitionFeeId; //1

    @ManyToOne
    @JoinColumn(name = "student_id")
    Student student;

    @ManyToOne
    @JoinColumn(name = "class_id")
    EntityClass entityClass; // ai eo 4.0

    @Column(name = "fee_year_month", nullable = false)
    LocalDate yearMonth; // 2025-06

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal amount; // 1.000.000

    @Column(precision = 10, scale = 2)
    BigDecimal paidAmount; // 10.000

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal remainingAmount; // 990.000

    @CreatedDate
    LocalDateTime createdAt;

    @Override
    public String toString() {
        return "TuitionFee{" +
                "tuitionFeeId='" + tuitionFeeId + '\'' +
                ", student=" + student.getFullName() +
                ", entityClass=" + entityClass.getClassName() +
                ", yearMonth=" + yearMonth +
                ", amount=" + amount +
                ", remainingAmount=" + remainingAmount +
                ", createdAt=" + createdAt +
                '}';
    }
}
