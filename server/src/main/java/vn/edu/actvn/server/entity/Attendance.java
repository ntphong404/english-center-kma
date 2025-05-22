package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String attendanceId;

    @ManyToOne
    @JoinColumn(name = "class_id")
    EntityClass entityClass;

    @ManyToOne
    @JoinColumn(name = "student_id")
    User student;

    @Column(nullable = false)
    LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Status status;

    @Column(columnDefinition = "TEXT")
    String notes;

    public enum Status {
        PRESENT, ABSENT
    }
}
