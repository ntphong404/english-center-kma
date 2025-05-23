package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.AttendanceUpdateRequest;
import vn.edu.actvn.server.dto.request.CreateAttendanceRequest;
import vn.edu.actvn.server.dto.response.AttendanceResponse;
import vn.edu.actvn.server.entity.Attendance;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.AttendanceMapper;
import vn.edu.actvn.server.repository.AttendanceRepository;
import vn.edu.actvn.server.repository.ClassRepository;
import vn.edu.actvn.server.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AttendanceService {
    AttendanceRepository attendanceRepository;
    AttendanceMapper attendanceMapper;
    ClassRepository classRepository;
    UserRepository userRepository;

    public AttendanceResponse createAttendance(CreateAttendanceRequest createAttendanceRequest) {
        Attendance attendance = attendanceMapper.toAttendance(createAttendanceRequest);
        attendance.setEntityClass(classRepository.findById(createAttendanceRequest.getClassId())
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED)));
        attendance.setStudent(userRepository.findById(createAttendanceRequest.getStudentId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        return attendanceMapper.toAttendanceResponse(attendanceRepository.save(attendance));
    }

    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream()
                .map(attendanceMapper::toAttendanceResponse)
                .toList();
    }

    public List<AttendanceResponse> getAttendanceByClassIdAndDate(String classId, LocalDate date) {
        return attendanceRepository.findByEntityClass_ClassIdAndDate(classId,date)
                .stream()
                .map(attendanceMapper::toAttendanceResponse)
                .toList();
    }

    public List<AttendanceResponse> getAttendanceByClassIdAndDateAndStatus(String classId, LocalDate date, Attendance.Status status) {
        return attendanceRepository.findByEntityClass_ClassIdAndDateAndStatus(classId,date,status)
                .stream()
                .map(attendanceMapper::toAttendanceResponse)
                .toList();
    }

    public List<AttendanceResponse> getAttendanceByStudentIdAndDate(String studentId, LocalDate date) {
        List<Attendance> attendances = attendanceRepository.findByStudent_UserIdAndDate(studentId,date);
        if(attendances.isEmpty()) throw  new AppException(ErrorCode.ATTENDANCE_NOT_EXISTED);
        return attendances.stream()
                .map(attendanceMapper::toAttendanceResponse)
                .toList();
    }

    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date)
                .stream()
                .map(attendanceMapper::toAttendanceResponse)
                .toList();
    }

    public AttendanceResponse getAttendanceById(String id) {
        return attendanceMapper.toAttendanceResponse(attendanceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ATTENDANCE_NOT_EXISTED)));
    }

    public AttendanceResponse updateAttendance(String id, AttendanceUpdateRequest attendanceUpdateRequest) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ATTENDANCE_NOT_EXISTED));
        attendance = attendanceMapper.updateAttendance(attendanceUpdateRequest, attendance);
        return attendanceMapper.toAttendanceResponse(attendanceRepository.save(attendance));
    }

    public long CountAttendanceByStudentIdAndStatus(String studentId, Attendance.Status status) {
        return attendanceRepository.countByStudent_UserIdAndStatus(studentId, status);
    }

    public void deleteAttendance(String id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ATTENDANCE_NOT_EXISTED));
        attendanceRepository.delete(attendance);
    }

    public List<AttendanceResponse> getAttendanceByStudentId(String studentId) {
        return attendanceRepository.findByStudent_UserId(studentId)
                .stream()
                .map(attendanceMapper::toAttendanceResponse)
                .toList();
    }

    public List<AttendanceResponse> getAttendanceByStudentIdAndClassId(String studentId, String classId) {
        return attendanceRepository.findByStudent_UserIdAndEntityClass_ClassId(studentId, classId)
                .stream()
                .map(attendanceMapper::toAttendanceResponse)
                .toList();
    }
}
