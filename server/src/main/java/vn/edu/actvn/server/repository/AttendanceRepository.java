package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {

    List<Attendance> findByEntityClass_ClassId(String classId);
    Page<Attendance> findByEntityClass_ClassId(String classId, Pageable pageable);

    Optional<Attendance> findByEntityClass_ClassIdAndDate(String classId, LocalDate date);

    List<Attendance> findByEntityClass_ClassIdAndDateBetween(String classId, LocalDate start, LocalDate end);
}
