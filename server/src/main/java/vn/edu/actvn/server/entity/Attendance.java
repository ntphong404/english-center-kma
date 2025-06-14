package vn.edu.actvn.server.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

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

    @Column(nullable = false)
    LocalDate date;

    @ElementCollection
    @CollectionTable(name = "attendance_student", joinColumns = @JoinColumn(name = "attendance_id"))
    List<StudentAttendance> studentAttendances;

    public enum Status {
        PRESENT, ABSENT
    }
}