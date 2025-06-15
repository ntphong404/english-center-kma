package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Payment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Payment, String> {
}
