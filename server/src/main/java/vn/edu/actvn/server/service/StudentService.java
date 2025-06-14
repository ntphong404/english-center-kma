package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public Student getById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public List<UserResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(userMapper::toStudentResponse)
                .toList();
    }

    public Page<UserResponse> getAllStudents(Pageable pageable) {
        return studentRepository.findAll(pageable)
                .map(userMapper::toStudentResponse);
    }

    public UserResponse getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toStudentResponse(student);
    }

    public List<UserResponse> getStudentsByIds(List<String> ids) {
        List<Student> students = studentRepository.findAllById(ids);
        if (students.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        return students.stream()
                .map(userMapper::toStudentResponse)
                .toList();
    }

    public UserResponse updateStudent(String studentId, UpdateStudentRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.updateStudent(student, request);
        return userMapper.toStudentResponse(studentRepository.save(student));
    }

    public UserResponse patchStudent(String studentId, UpdateStudentRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.patchStudent(student, request);
        return userMapper.toStudentResponse(studentRepository.save(student));
    }

    public UserResponse createStudent(CreateStudentRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Student student = userMapper.toStudent(request);
        student.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findById("STUDENT")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        student.setRole(role);

        return userMapper.toUserResponse(userRepository.save(student));
    }

    public void deleteStudent(String id) {
        studentRepository.deleteById(id);
    }
}