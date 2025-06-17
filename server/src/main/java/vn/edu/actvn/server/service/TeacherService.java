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
import vn.edu.actvn.server.dto.request.user.CreateTeacherRequest;
import vn.edu.actvn.server.dto.request.user.UpdateTeacherRequest;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.entity.Role;
import vn.edu.actvn.server.entity.Teacher;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.UserMapper;
import vn.edu.actvn.server.repository.RoleRepository;
import vn.edu.actvn.server.repository.UserRepository;
import vn.edu.actvn.server.repository.TeacherRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TeacherService {
    TeacherRepository teacherRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;
    UserRepository userRepository;

    public List<UserResponse> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(userMapper::toTeacherResponse)
                .toList();
    }

    @PreAuthorize("hasAuthority('TEACHER_READ_ALL')")
    public Page<UserResponse> getAllTeachers(Pageable pageable) {
        return teacherRepository.findAll(pageable)
                .map(userMapper::toTeacherResponse);
    }

    @PreAuthorize("hasAuthority('TEACHER_READ')")
    public UserResponse getTeacherById(String id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toTeacherResponse(teacher);
    }

    @PreAuthorize("hasAuthority('TEACHER_UPDATE')")
    public UserResponse updateTeacher(String teacherId,UpdateTeacherRequest request) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.updateTeacher(teacher, request);
        return userMapper.toTeacherResponse(teacherRepository.save(teacher));
    }

    @PreAuthorize("hasAuthority('TEACHER_UPDATE')")
    public UserResponse patchTeacher(String teacherId,UpdateTeacherRequest request) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.patchTeacher(teacher, request);
        return userMapper.toTeacherResponse(teacherRepository.save(teacher));
    }

    @PreAuthorize("hasAuthority('TEACHER_CREATE')")
    public UserResponse createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Teacher teacher = userMapper.toTeacher(request);
        teacher.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findById("TEACHER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        teacher.setRole(role);

        return userMapper.toUserResponse(userRepository.save(teacher));
    }

    @PreAuthorize("hasAuthority('TEACHER_DELETE')")
    public void deleteTeacher(String id) {
        teacherRepository.deleteById(id);
    }
}