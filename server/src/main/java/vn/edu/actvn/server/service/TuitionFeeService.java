package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.tuitionfee.CreateTuitionFeeRequest;
import vn.edu.actvn.server.dto.request.tuitionfee.UpdateTuitionFeeRequest;
import vn.edu.actvn.server.dto.response.tuitionfee.TuitionFeeResponse;
import vn.edu.actvn.server.entity.*;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.TuitionFeeMapper;
import vn.edu.actvn.server.repository.AttendanceRepository;
import vn.edu.actvn.server.repository.TuitionFeeRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TuitionFeeService {

    TuitionFeeRepository tuitionFeeRepository;
    TuitionFeeMapper tuitionFeeMapper;
    StudentService studentService;
    ClassService classService;
    AttendanceRepository attendanceRepository;

    private long countStudentPresentDaysInMonth(String studentId, String classId, LocalDate yearMonth) {
        YearMonth month = YearMonth.from(yearMonth);
        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();

        List<Attendance> attendances = attendanceRepository
                .findByEntityClass_ClassIdAndDateBetween(classId, startDate, endDate);

        return attendances.stream()
                .flatMap(attendance -> attendance.getStudentAttendances().stream())
                .filter(sa -> sa.getStudentId().equals(studentId)
                        && sa.getStatus() == Attendance.Status.PRESENT)
                .count();
    }

    public TuitionFeeResponse createTuitionFee(CreateTuitionFeeRequest request) {
        request.setYearMonth(request.getYearMonth().withDayOfMonth(1));
        TuitionFee tuitionFee = tuitionFeeRepository
                .findByStudent_UserIdAndYearMonth(request.getStudentId(), request.getYearMonth());

        if (tuitionFee == null) {
            tuitionFee = tuitionFeeMapper.toTuitionFee(request);
        }

        Student student = studentService.getById(request.getStudentId());
        EntityClass entityClass = classService.getById(request.getClassId());

        tuitionFee.setStudent(student);
        tuitionFee.setEntityClass(entityClass);

        long numDaysPresent = countStudentPresentDaysInMonth(
                        request.getStudentId(), request.getClassId(),
                        request.getYearMonth());
        BigDecimal amount = entityClass.getUnitPrice().multiply(BigDecimal.valueOf(numDaysPresent));
        int discount = student.getClassDiscounts().stream()
                .filter(cd -> cd.getClassId().equals(entityClass.getClassId()))
                .map(ClassDiscount::getDiscount)
                .findFirst()
                .orElse(0);
        tuitionFee.setAmount(amount.multiply(BigDecimal.valueOf(100 - discount))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));

        tuitionFee.setPaidAmount(tuitionFee.getPaidAmount()==null? BigDecimal.ZERO : tuitionFee.getPaidAmount());
        tuitionFee.setRemainingAmount(tuitionFee.getAmount().subtract(tuitionFee.getPaidAmount()));

        TuitionFee savedTuitionFee = tuitionFeeRepository.save(tuitionFee);
        return tuitionFeeMapper.toTuitionFeeResponse(savedTuitionFee);
    }

    @PreAuthorize("hasAuthority('TUITION_FEE_READ_ALL') || hasRole('ADMIN')")
    public Page<TuitionFeeResponse> getAllTuitionFees(String studentId,String classId,YearMonth yearMonth,Pageable pageable) {
        LocalDate yearMonthDate = yearMonth != null ? yearMonth.atDay(1) : null;
        if (studentId == null) studentId = "";
        if (classId == null) classId = "";
        return tuitionFeeRepository.search(studentId,classId, yearMonthDate, pageable)
                .map(tuitionFeeMapper::toTuitionFeeResponse);
    }

    @PreAuthorize("hasAuthority('TUITION_FEE_READ') || hasRole('ADMIN')")
    public TuitionFeeResponse getTuitionFeeById(String id) {
        return tuitionFeeRepository.findById(id)
                .map(tuitionFeeMapper::toTuitionFeeResponse)
                .orElseThrow(() -> new AppException(ErrorCode.TUITION_FEE_NOT_EXISTED));
    }

    @PreAuthorize("hasAuthority('TUITION_FEE_UPDATE') || hasRole('ADMIN')")
    public TuitionFeeResponse partialUpdateTuitionFee(String id, UpdateTuitionFeeRequest request) {
        TuitionFee existingTuitionFee = tuitionFeeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TUITION_FEE_NOT_EXISTED));

        if (request.getStudentId() != null && !request.getStudentId().equals(existingTuitionFee.getStudent().getUserId())) {
            Student newStudent = studentService.getById(request.getStudentId());
            existingTuitionFee.setStudent(newStudent);
        }

        if (request.getClassId() != null && !request.getClassId().equals(existingTuitionFee.getEntityClass().getClassId())) {
            EntityClass newClass = classService.getById(request.getClassId());
            existingTuitionFee.setEntityClass(newClass);
        }

        tuitionFeeMapper.partialUpdate(request, existingTuitionFee);
        TuitionFee updatedTuitionFee = tuitionFeeRepository.save(existingTuitionFee);
        return tuitionFeeMapper.toTuitionFeeResponse(updatedTuitionFee);
    }

    @PreAuthorize("hasAuthority('TUITION_FEE_DELETE') || hasRole('ADMIN')")
    public void deleteTuitionFee(String id) {
        if (!tuitionFeeRepository.existsById(id)) {
            throw new AppException(ErrorCode.TUITION_FEE_NOT_EXISTED);
        }
        tuitionFeeRepository.deleteById(id);
    }
}
