package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Attendance;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {

    List<Attendance> findByStudent_UserIdAndDate(String studentId, LocalDate date);

    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByEntityClass_ClassIdAndDate(String classId, LocalDate date);

    List<Attendance> findByStudent_UserId(String studentId);
    List<Attendance> findByStudent_UserIdAndEntityClass_ClassId(String studentId, String classId);

    List<Attendance> findByEntityClass_ClassIdAndDateAndStatus(String classId, LocalDate date, Attendance.Status status);
    long countByStudent_UserIdAndStatus(String userId, Attendance.Status status);

}
