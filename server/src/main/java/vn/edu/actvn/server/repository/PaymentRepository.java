package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Payment;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByTuitionFee_Student_UserId(String studentId);
    List<Payment> findByTuitionFee_Student_UserIdAndTuitionFee_EntityClass_ClassId(String studentId,String classId);
    Page<Payment> findByTuitionFee_Student_UserId(Pageable pageable, String studentId);
}
