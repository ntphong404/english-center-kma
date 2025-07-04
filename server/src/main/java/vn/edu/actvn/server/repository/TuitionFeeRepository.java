package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.TuitionFee;

import java.math.BigDecimal;
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
        LEFT JOIN tf.entityClass class
    WHERE (LOWER(tf.student.userId) LIKE LOWER(CONCAT('%', :studentId, '%')))
      AND (LOWER(tf.entityClass.classId) LIKE LOWER(CONCAT('%', :classId, '%')))
      AND (tf.yearMonth = COALESCE(:yearMonth, tf.yearMonth))
""")
    Page<TuitionFee> search(@Param("studentId") String studentId,@Param("classId") String classId, @Param("yearMonth") LocalDate yearMonth, Pageable pageable);

    // Summary tuition fees for a student in a specific month
    @Query("""
        SELECT COALESCE(SUM(tf.paidAmount), 0) FROM TuitionFee tf
        WHERE tf.yearMonth = :yearMonth
    """)
    BigDecimal getTotalPaidAmountByMonth(@Param("yearMonth") LocalDate yearMonth);

    @Query("""
        SELECT COALESCE(SUM(tf.remainingAmount), 0) FROM TuitionFee tf
        WHERE tf.yearMonth = :yearMonth
    """)
    BigDecimal getTotalUnpaidAmountByMonth(@Param("yearMonth") LocalDate yearMonth);



}
