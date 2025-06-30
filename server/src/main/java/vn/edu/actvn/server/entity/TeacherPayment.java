package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EntityListeners(AuditingEntityListener.class)
public class TeacherPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    private int month;
    private int year;

    private BigDecimal amount; // Total salary for the month
    private BigDecimal paidAmount; // Amount paid so far
    private BigDecimal remainingAmount;
    @CreatedDate
    LocalDateTime createdAt;

    private String note;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Override
    public String toString() {
        return "TeacherPayment{" +
                "id='" + id + '\'' +
                ", teacher=" + teacher.getUserId() +
                ", month=" + month +
                ", year=" + year +
                ", amount=" + amount +
                ", paidAmount=" + paidAmount +
                ", createdAt=" + createdAt +
                ", note='" + note + '\'' +
                ", status=" + status +
                '}';
    }

    public enum Status {
        UNPAID, PARTIALLY_PAID, PAID
    }
}
