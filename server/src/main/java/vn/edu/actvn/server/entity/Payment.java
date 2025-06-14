package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

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
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String paymentId; //1  2

    LocalDate paymentDate;

    @ManyToOne
    @JoinColumn(name = "tuition_fee_id")
    TuitionFee tuitionFee; // 1

    @ManyToOne
    @JoinColumn(name = "student_id")
    Student student; // duy ngu

    @Column(name = "billing_month", columnDefinition = "DATE")
    private YearMonth yearMonth; // 2025-06
    double amount; // 10.000

    @CreatedDate
    LocalDateTime createdAt;

    @LastModifiedDate
    LocalDateTime updatedAt;
}
