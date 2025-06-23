package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Payment;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    @Query("""
        SELECT p FROM Payment p
        WHERE LOWER(p.tuitionFee.student.userId) LIKE LOWER(CONCAT('%', :studentId, '%'))
           AND LOWER(p.tuitionFee.entityClass.classId) LIKE LOWER(CONCAT('%', :classId, '%'))
    """)
    Page<Payment> search(@Param("studentId") String studentId, @Param("classId") String classId, Pageable pageable);
}
