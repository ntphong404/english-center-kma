package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.actvn.server.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, String> {
}
