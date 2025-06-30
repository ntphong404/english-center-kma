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
import org.springframework.transaction.annotation.Transactional;
import vn.edu.actvn.server.dto.request.user.CreateParentRequest;
import vn.edu.actvn.server.dto.request.user.UpdateParentRequest;
import vn.edu.actvn.server.dto.response.user.UserResponse;
import vn.edu.actvn.server.entity.Parent;
import vn.edu.actvn.server.entity.Role;
import vn.edu.actvn.server.entity.Student;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.UserMapper;
import vn.edu.actvn.server.repository.ParentRepository;
import vn.edu.actvn.server.repository.RoleRepository;
import vn.edu.actvn.server.repository.StudentRepository;
import vn.edu.actvn.server.repository.UserRepository;
import vn.edu.actvn.server.utils.RandomAvatar;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ParentService {
    ParentRepository parentRepository;
    UserMapper userMapper;
    UserRepository userRepository;
    RoleRepository roleRepository;
    StudentRepository studentRepository;
    PasswordEncoder passwordEncoder;

    @PreAuthorize("hasAuthority('PARENT_READ_ALL') || hasRole('ADMIN')")
    public Page<UserResponse> getAllParents(String fullName,String email, Pageable pageable) {
        if (fullName == null) fullName = "";
        if (email == null)  email = "";
        return parentRepository.search(fullName, email,pageable)
                .map(userMapper::toParentResponse);
    }

    @PreAuthorize("hasAuthority('PARENT_READ') || hasRole('ADMIN')")
    public UserResponse getParentById(String id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toParentResponse(parent);
    }

    @PreAuthorize("hasAuthority('PARENT_UPDATE') || hasRole('ADMIN')")
    @Transactional
    public UserResponse patchParent(String parentId, UpdateParentRequest request) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.patchParent(parent, request);
        return userMapper.toParentResponse(parentRepository.save(parent));
    }

    @PreAuthorize("hasAuthority('PARENT_CREATE') || hasRole('ADMIN')")
    @Transactional
    public UserResponse createParent(CreateParentRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Parent parent = userMapper.toParent(request);
        parent.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findById("PARENT")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        parent.setRole(role);

        parent.setAvatarUrl(RandomAvatar.getRandomAvatar(parent.getGender().equals("MALE")));
        return userMapper.toUserResponse(userRepository.save(parent));
    }

    @PreAuthorize("hasAuthority('PARENT_UPDATE') || hasRole('ADMIN')")
    @Transactional
    public UserResponse addStudent(String parentId, String studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (parent.getStudentIds().stream().anyMatch(s -> s.equals(studentId))) {
            throw new AppException(ErrorCode.STUDENT_ALREADY_ADDED);
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (student.getParentId() != null && !student.getParentId().equals(parentId)) {
            throw new AppException(ErrorCode.STUDENT_ALREADY_HAS_PARENT);
        }
        if (student.getParentId() == null) {
            student.setParentId(parentId);
            studentRepository.save(student);
        }
        parent.getStudentIds().add(studentId);

        return userMapper.toParentResponse(parentRepository.save(parent));
    }

    @PreAuthorize("hasAuthority('PARENT_UPDATE') || hasRole('ADMIN')")
    public UserResponse removeStudent(String parentId, String studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!parent.getStudentIds().remove(studentId)) {
            throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (student.getParentId() != null && student.getParentId().equals(parentId)) {
            student.setParentId(null);
            studentRepository.save(student);
        } else {
            throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        }

        return userMapper.toParentResponse(parentRepository.save(parent));
    }

    @PreAuthorize("hasAuthority('PARENT_DELETE') || hasRole('ADMIN')")
    public void deleteParent(String id) {
        parentRepository.deleteById(id);
    }
}
