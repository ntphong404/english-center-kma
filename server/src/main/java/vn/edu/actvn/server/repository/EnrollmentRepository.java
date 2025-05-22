package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.actvn.server.entity.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
}
