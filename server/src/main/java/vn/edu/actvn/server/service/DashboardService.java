package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.response.dashboard.AdminAnalyticsResponse;
import vn.edu.actvn.server.dto.response.dashboard.AdminDashboardResponse;
import vn.edu.actvn.server.dto.response.entityclass.ClassResponse;
import vn.edu.actvn.server.dto.response.dashboard.LevelDistributionDto;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.entity.TeacherPayment;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.ClassMapper;
import vn.edu.actvn.server.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardService {
    TeacherRepository teacherRepository;
    StudentRepository studentRepository;
    TuitionFeeRepository tuitionFeeRepository;
    ClassRepository classRepository;
    ClassService classService;
    TeacherPaymentRepository teacherPaymentRepository;

    public AdminDashboardResponse getAdminDashboard(Integer month, Integer year) {

        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        LocalDate date = LocalDate.of(year, month, 1);
        // Assuming the repositories have methods to calculate the total tuition fees
        BigDecimal totalPaid = tuitionFeeRepository.getTotalPaidAmountByMonth(date);
        BigDecimal totalUnpaid = tuitionFeeRepository.getTotalUnpaidAmountByMonth(date);

        List<ClassResponse> classesUpcoming = classService.getClasses("","","",0,
                EntityClass.Status.UPCOMING,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "startDate"))).getContent();
        return AdminDashboardResponse.builder()
                .totalTeachers(teacherRepository.count())
                .totalStudents(studentRepository.count())
                .totalTuitionFeesOfMonth(totalPaid)
                .totalTuitionFeesUnPaid(totalUnpaid)
                .classesUpcoming(classesUpcoming)
                .build();
    }

    public AdminAnalyticsResponse getAnalyticsDashboard() {
        int year = LocalDate.now().getYear();

        int studentCount = (int) studentRepository.count();
        int classCount = (int) classRepository.count();
        int teacherCount = (int) teacherRepository.count();
        int studentsNoClass = studentRepository.countStudentsWithNoClassDiscounts().intValue();

        int studentsWithClass = studentCount - studentsNoClass;
        int retentionRate = studentCount > 0
                ? (int) Math.round((studentsWithClass * 100.0) / studentCount)
                : 0;

        // Tổng lương giáo viên và theo tháng
        List<Integer> teacherSalaryByMonth = new ArrayList<>();
        BigDecimal totalTeacherSalary = BigDecimal.ZERO;

        // Doanh thu học phí
        List<Integer> revenueByMonth = new ArrayList<>();

        // Học sinh không có lớp và tạo mới theo tháng
        List<Integer> studentsNoClassByMonth = new ArrayList<>();
        List<Integer> studentsCreatedByMonth = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            LocalDate date = LocalDate.of(year, m, 1);
            LocalDate start = date;
            LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

            // Revenue
            BigDecimal paid = tuitionFeeRepository.getTotalPaidAmountByMonth(date);
            revenueByMonth.add(paid != null ? paid.intValue() : 0);

            // Teacher salary
            Page<TeacherPayment> page = teacherPaymentRepository.search(
                    "", m, year,
                    PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt"))
            );

            // Lấy bản ghi đầu tiên (nếu có), rồi lấy paidAmount
            BigDecimal paidAmount = page.getContent().stream()
                    .findFirst()
                    .map(TeacherPayment::getPaidAmount)
                    .orElse(BigDecimal.ZERO);

            teacherSalaryByMonth.add(paidAmount.intValue());
            totalTeacherSalary = totalTeacherSalary.add(paidAmount);

            // Student stats
            studentsNoClassByMonth.add(
                    studentRepository.countStudentsWithNoClassDiscountsByCreatedAtBetween(
                            start.atStartOfDay(), end.atTime(23, 59, 59)).intValue()
            );
            studentsCreatedByMonth.add(
                    studentRepository.countByCreatedAtBetween(
                            start.atStartOfDay(), end.atTime(23, 59, 59)).intValue()
            );
        }

        // Tính theo quý
        List<Integer> revenueByQuarter = calcQuarterSums(revenueByMonth);
        List<Integer> teacherSalaryByQuarter = calcQuarterSums(teacherSalaryByMonth);

        // Level distribution: từ khối 1 đến 5
        List<LevelDistributionDto> levelDist = IntStream.rangeClosed(1, 5)
                .mapToObj(grade -> new LevelDistributionDto(
                        "Khối " + grade,
                        classService.getClasses("", "", "", grade, EntityClass.Status.OPEN, PageRequest.of(0, 1)).getTotalElements()
                )).collect(Collectors.toList());

        return AdminAnalyticsResponse.builder()
                .studentCount(studentCount)
                .classCount(classCount)
                .teacherCount(teacherCount)
                .retentionRate(retentionRate)
                .studentsNoClass(studentsNoClass)
                .totalTeacherSalary(totalTeacherSalary)
                .currentYear(year)
                .revenueByMonth(revenueByMonth)
                .revenueByQuarter(revenueByQuarter)
                .teacherSalaryByMonth(teacherSalaryByMonth)
                .teacherSalaryByQuarter(teacherSalaryByQuarter)
                .studentsNoClassByMonth(studentsNoClassByMonth)
                .studentsCreatedByMonth(studentsCreatedByMonth)
                .levelDist(levelDist)
                .build();
    }

    private List<Integer> calcQuarterSums(List<Integer> monthlyList) {
        return List.of(
                monthlyList.subList(0, 3).stream().mapToInt(i -> i).sum(),
                monthlyList.subList(3, 6).stream().mapToInt(i -> i).sum(),
                monthlyList.subList(6, 9).stream().mapToInt(i -> i).sum(),
                monthlyList.subList(9, 12).stream().mapToInt(i -> i).sum()
        );
    }

}
