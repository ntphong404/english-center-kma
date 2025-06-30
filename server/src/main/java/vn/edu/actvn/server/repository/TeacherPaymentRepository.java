package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.TeacherPayment;

@Repository
public interface TeacherPaymentRepository extends JpaRepository<TeacherPayment, String> {

    @Query("""
        SELECT tp FROM TeacherPayment tp
        WHERE (:month = 0 or tp.month = :month)
            AND (:year = 0 or tp.year = :year)
            AND (LOWER(tp.teacher.userId) LIKE LOWER(CONCAT('%', :teacherId, '%')))
    """)
    Page<TeacherPayment> search (String teacherId,Integer month, Integer year, Pageable pageable);
}

