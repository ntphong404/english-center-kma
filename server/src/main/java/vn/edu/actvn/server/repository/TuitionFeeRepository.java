package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.TuitionFee;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Repository
public interface TuitionFeeRepository extends JpaRepository<TuitionFee, String> {
    Page<TuitionFee> findByStudent_UserId(Pageable pageable,String studentId);
    TuitionFee findByStudent_UserIdAndYearMonth(String studentId, LocalDate yearMonth);
    @Query("""
    SELECT tf FROM TuitionFee tf
        LEFT JOIN tf.student student
    WHERE (:studentId IS NULL OR LOWER(tf.student.userId) LIKE LOWER(CONCAT('%', :studentId, '%')))
      AND (tf.yearMonth = COALESCE(:yearMonth, tf.yearMonth))
""")
    Page<TuitionFee> search(@Param("studentId") String studentId, @Param("yearMonth") LocalDate yearMonth, Pageable pageable);
}
