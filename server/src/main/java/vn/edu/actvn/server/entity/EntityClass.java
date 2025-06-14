package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    @Column(nullable = false)
    Integer grade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Status status;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    Teacher teacher;

    @ManyToMany
    @JoinTable(
            name = "class_students",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    List<Student> students;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal unitPrice;

    LocalDate startDate;
    LocalDate endDate;

    LocalTime startTime;
    LocalTime endTime;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    List<DayOfWeek> daysOfWeek;

    @CreatedDate
    LocalDateTime createdAt;

    @LastModifiedDate
    LocalDateTime updatedAt;

    public enum Status {
        OPEN, CLOSED
    }
}
