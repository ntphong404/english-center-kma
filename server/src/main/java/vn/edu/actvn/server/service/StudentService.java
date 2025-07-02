package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.user.CreateStudentRequest;
import vn.edu.actvn.server.dto.request.user.UpdateStudentRequest;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.entity.Role;
import vn.edu.actvn.server.entity.Student;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.UserMapper;
import vn.edu.actvn.server.repository.RoleRepository;
import vn.edu.actvn.server.repository.StudentRepository;
import vn.edu.actvn.server.repository.UserRepository;
import vn.edu.actvn.server.utils.RandomAvatar;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StudentService {
    StudentRepository studentRepository;
    UserMapper userMapper;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @PreAuthorize("hasAuthority('STUDENT_READ') || hasRole('ADMIN')")
    public Student getById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @PreAuthorize("hasAuthority('STUDENT_READ_ALL') || hasRole('ADMIN')")
    public Page<UserResponse> getAllStudents(String fullName,String email, Pageable pageable) {
        if (fullName == null) fullName = "";
        if (email == null)  email = "";
        return studentRepository.search(fullName, email,pageable)
                .map(userMapper::toStudentResponse);
    }

    @PreAuthorize("hasAuthority('STUDENT_READ') || hasRole('ADMIN')")
    public UserResponse getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toStudentResponse(student);
    }

    @PreAuthorize("hasAuthority('STUDENT_READ') || hasRole('ADMIN')")
    public List<UserResponse> getStudentsByIds(List<String> ids) {
        List<Student> students = studentRepository.findAllById(ids);
        if (students.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        return students.stream()
                .map(userMapper::toStudentResponse)
                .toList();
    }

    @PreAuthorize("hasAuthority('STUDENT_UPDATE') || hasRole('ADMIN')")
    public UserResponse patchStudent(String studentId, UpdateStudentRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.patchStudent(student, request);
        return userMapper.toStudentResponse(studentRepository.save(student));
    }

    @PreAuthorize("hasAuthority('STUDENT_CREATE') || hasRole('ADMIN')")
    public UserResponse createStudent(CreateStudentRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Student student = userMapper.toStudent(request);
        student.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findById("STUDENT")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        student.setRole(role);

        student.setAvatarUrl(RandomAvatar.getRandomAvatar(student.getGender().equals("MALE")));
        return userMapper.toUserResponse(userRepository.save(student));
    }

    @PreAuthorize("hasAuthority('STUDENT_DELETE') || hasRole('ADMIN')")
    public void deleteStudent(String id) {
        studentRepository.deleteById(id);
    }

    public Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end) {
        return studentRepository.countByCreatedAtBetween(start, end);
    }

    public Long countStudentsWithNoClassDiscounts() {
        return studentRepository.countStudentsWithNoClassDiscounts();
    }

    public Long countStudentsWithNoClassDiscountsByCreatedAtBetween(LocalDateTime start, LocalDateTime end) {
        return studentRepository.countStudentsWithNoClassDiscountsByCreatedAtBetween(start, end);
    }
}
