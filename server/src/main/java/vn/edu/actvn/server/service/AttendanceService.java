package vn.edu.actvn.server.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.attendance.AttendanceUpdateRequest;
import vn.edu.actvn.server.dto.request.tuitionfee.CreateTuitionFeeRequest;
import vn.edu.actvn.server.dto.response.attendance.AttendanceResponse;
import vn.edu.actvn.server.entity.Attendance;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.entity.StudentAttendance;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.AttendanceMapper;
import vn.edu.actvn.server.repository.AttendanceRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class AttendanceService {

    AttendanceRepository attendanceRepository;
    AttendanceMapper attendanceMapper;
    ClassService classService;
    TuitionFeeService tuitionFeeService;

    @PreAuthorize("hasAuthority('ATTENDANCE_CREATE')")
    public AttendanceResponse getAttendanceToday(String classId) {
        EntityClass entityClass = classService.getById(classId);
        LocalDate today = LocalDate.now();
        DayOfWeek todayDayOfWeek = today.getDayOfWeek();

        boolean isValidDate = !today.isBefore(entityClass.getStartDate())
                && !today.isAfter(entityClass.getEndDate())
                && entityClass.getDaysOfWeek().contains(todayDayOfWeek);

        if (!isValidDate) {
            throw new AppException(ErrorCode.TODAY_NOT_VALID_FOR_ATTENDANCE);
        }

        Attendance attendance = attendanceRepository.findByEntityClass_ClassIdAndDate(classId, today)
                .orElseGet(() -> {
                    Attendance newAttendance = Attendance.builder()
                            .entityClass(entityClass)
                            .date(today)
                            .studentAttendances(entityClass.getStudents().stream()
                                    .map(student -> {
                                        StudentAttendance sa = new StudentAttendance();
                                        sa.setStudentId(student.getUserId());
                                        sa.setStatus(Attendance.Status.ABSENT);
                                        return sa;
                                    })
                                    .toList())
                            .build();
                    return attendanceRepository.save(newAttendance);
                });

        return attendanceMapper.toAttendanceResponse(attendance);
    }

    @PreAuthorize("hasAuthority('ATTENDANCE_READ')")
    public AttendanceResponse getById(String id) {
        return attendanceRepository.findById(id)
                .map(attendanceMapper::toAttendanceResponse)
                .orElseThrow();
    }

    @PreAuthorize("hasAuthority('ATTENDANCE_READ')")
    public Page<AttendanceResponse> getAllByClassId(String classId, Pageable pageable) {
        return attendanceRepository.findByEntityClass_ClassId(classId,pageable)
                .map(attendanceMapper::toAttendanceResponse);
    }

    @PreAuthorize("hasAuthority('ATTENDANCE_UPDATE')")
    public AttendanceResponse update(String id, AttendanceUpdateRequest request) {
        Attendance existing = attendanceRepository.findById(id).orElseThrow();
        existing.setStudentAttendances(request.getStudentAttendances());
        Attendance saved = attendanceRepository.save(existing);
        return attendanceMapper.toAttendanceResponse(saved);
    }

    @PreAuthorize("hasAuthority('ATTENDANCE_UPDATE')")
    public AttendanceResponse partialUpdateAttendance(String id, AttendanceUpdateRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ATTENDANCE_NOT_FOUND));

        attendanceMapper.partiallyUpdateAttendance(attendance, request);
        Attendance updated = attendanceRepository.save(attendance);

        updated.getStudentAttendances().forEach(student -> {
            CreateTuitionFeeRequest tuitionFeeRequest = CreateTuitionFeeRequest.builder()
                    .studentId(student.getStudentId())
                    .classId(attendance.getEntityClass().getClassId())
                    .yearMonth(attendance.getDate())
                    .build();
            tuitionFeeService.createTuitionFee(tuitionFeeRequest);
        });

        return attendanceMapper.toAttendanceResponse(updated);
    }

    @PreAuthorize("hasAuthority('ATTENDANCE_UPDATE')")
    public void delete(String id) {
        Optional<Attendance> attendance = attendanceRepository.findById(id);
        if (attendance.isEmpty()) {
            throw new AppException(ErrorCode.ATTENDANCE_NOT_FOUND);
        }
        attendanceRepository.delete(attendance.get());
    }
}
