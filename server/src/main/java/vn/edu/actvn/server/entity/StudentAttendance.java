package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class StudentAttendance {
  String studentId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  Attendance.Status status;

  @Column(columnDefinition = "TEXT")
  String note;
}