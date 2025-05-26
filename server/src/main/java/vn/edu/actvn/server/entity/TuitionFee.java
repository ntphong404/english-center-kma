package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    String tuitionFeeId;

    @ManyToOne
    @JoinColumn(name = "student_id")
    User student;

    @ManyToOne
    @JoinColumn(name = "class_id")
    EntityClass entityClass;

    @Column(precision = 5, scale = 2)
    BigDecimal discount;

    @CreatedDate
    LocalDateTime createdAt;
}
