package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Payment;
import vn.edu.actvn.server.entity.TuitionFee;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Repository
public interface TuitionFeeRepository extends JpaRepository<TuitionFee, String> {
    List<TuitionFee> findByStudent_UserId(String studentId);
    TuitionFee findByStudent_UserIdAndYearMonth(String studentId, LocalDate yearMonth);
}
