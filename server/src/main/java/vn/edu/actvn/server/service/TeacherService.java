package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
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
import vn.edu.actvn.server.utils.RandomAvatar;

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

    @PreAuthorize("hasAuthority('TEACHER_READ_ALL') || hasRole('ADMIN')")
    public Page<UserResponse> getAllTeachers(String fullName, String email, Pageable pageable) {
        if(fullName==null) fullName="";
        if(email==null) email="";
        return teacherRepository.search(fullName,email,pageable)
                .map(userMapper::toTeacherResponse);
    }

    @PreAuthorize("hasAuthority('TEACHER_READ') || hasRole('ADMIN')")
    public UserResponse getTeacherById(String id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toTeacherResponse(teacher);
    }

    @PreAuthorize("hasAuthority('TEACHER_UPDATE') || hasRole('ADMIN')")
    public UserResponse patchTeacher(String teacherId,UpdateTeacherRequest request) {
        var context = SecurityContextHolder.getContext();
        String role = context.getAuthentication().getAuthorities().iterator().next().getAuthority();
        if(request.getSalary()!=null && !role.equals("ROLE_ADMIN")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.patchTeacher(teacher, request);
        return userMapper.toTeacherResponse(teacherRepository.save(teacher));
    }

    @PreAuthorize("hasAuthority('TEACHER_CREATE') || hasRole('ADMIN')")
    public UserResponse createTeacher(@NotNull CreateTeacherRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Teacher teacher = userMapper.toTeacher(request);
        teacher.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findById("TEACHER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        teacher.setRole(role);

        teacher.setAvatarUrl(RandomAvatar.getRandomAvatar(teacher.getGender().equals("MALE")));
        return userMapper.toUserResponse(userRepository.save(teacher));
    }

    @PreAuthorize("hasAuthority('TEACHER_DELETE') || hasRole('ADMIN')")
    public void deleteTeacher(String id) {
        teacherRepository.deleteById(id);
    }
}

