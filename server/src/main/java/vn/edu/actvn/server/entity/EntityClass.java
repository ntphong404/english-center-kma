package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "classes")
public class EntityClass {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String classId;

    @Column(nullable = false, length = 50)
    String className;

    @Column(nullable = false)
    Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Status status;

    @ManyToOne
    @JoinColumn(name = "teacher_id",
            referencedColumnName = "userId")
    User teacher;

    @ManyToMany
    @JoinTable(
            name = "class_students",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    List<User> students;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal totalAmount;

    int totalSessions;

    @CreatedDate
    LocalDateTime createdAt;

    @LastModifiedDate
    LocalDateTime updatedAt;

    BigDecimal calculateUnitPrice() {
        if (totalSessions == 0) {
            return BigDecimal.ZERO;
        }
        return totalAmount.divide(
                BigDecimal.valueOf(totalSessions),
                2, // số chữ số sau dấu phẩy
                RoundingMode.HALF_UP
        );
    }

    public enum Status {
        OPEN, CLOSED
    }
}
