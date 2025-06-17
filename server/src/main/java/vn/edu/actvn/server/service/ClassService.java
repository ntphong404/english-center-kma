package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.entityclass.ClassUpdateRequest;
import vn.edu.actvn.server.dto.request.entityclass.CreateClassRequest;
import vn.edu.actvn.server.dto.response.entityclass.ClassResponse;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.entity.Student;
import vn.edu.actvn.server.entity.Teacher;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.ClassMapper;
import vn.edu.actvn.server.repository.ClassRepository;
import vn.edu.actvn.server.repository.StudentRepository;
import vn.edu.actvn.server.repository.TeacherRepository;
import vn.edu.actvn.server.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ClassService {

    ClassRepository classRepository;
    TeacherRepository teacherRepository;
    StudentRepository studentRepository;
    ClassMapper classMapper;

    @PreAuthorize("hasAuthority('CLASS_READ')")
    public EntityClass getById(String id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));
    }

    @PreAuthorize("hasAuthority('CLASS_CREATE')")
    public ClassResponse createClass(CreateClassRequest createClassRequest) {
        EntityClass entityClass = classMapper.toEntityClass(createClassRequest);
        Teacher teacher = teacherRepository.findById(createClassRequest.getTeacherId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        entityClass.setTeacher(teacher);
        entityClass.setStatus(EntityClass.Status.OPEN);
        entityClass.setStudents(new ArrayList<>());

//        if(createClassRequest.getStudentIds() != null && !createClassRequest.getStudentIds().isEmpty()) {
//            addStudents(entityClass, createClassRequest.getStudentIds());
//        }

        return classMapper.toClassResponse(classRepository.save(entityClass));
    }

    @PreAuthorize("hasAuthority('CLASS_UPDATE')")
    public ClassResponse updateClass(String classId, ClassUpdateRequest classUpdateRequest) {
        EntityClass entityClass = findClassById(classId);
        if (isClosed(entityClass)) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }
        Teacher teacher = teacherRepository.findById(classUpdateRequest.getTeacherId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        entityClass.setTeacher(teacher);
        entityClass.setStudents(new ArrayList<>());

        classMapper.updateEntityClass(classUpdateRequest, entityClass);
        return classMapper.toClassResponse(classRepository.save(entityClass));
    }

    @PreAuthorize("hasAuthority('CLASS_UPDATE')")
    public ClassResponse patchClass(String classId, ClassUpdateRequest classUpdateRequest) {
        EntityClass entityClass = findClassById(classId);
        if (isClosed(entityClass)) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }
        Teacher teacher = teacherRepository.findById(classUpdateRequest.getTeacherId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        entityClass.setTeacher(teacher);
        entityClass.setStudents(new ArrayList<>());

        classMapper.patchEntityClass(classUpdateRequest, entityClass);
        return classMapper.toClassResponse(classRepository.save(entityClass));
    }

    @PreAuthorize("hasAuthority('CLASS_READ_ALL')")
    public List<ClassResponse> getClasses() {
        return classRepository.findAll().stream()
                .map(classMapper::toClassResponse)
                .toList();
    }

    @PreAuthorize("hasAuthority('CLASS_READ_ALL')")
    public Page<ClassResponse> getClasses(Pageable pageable) {
        return classRepository.findAll(pageable)
                .map(classMapper::toClassResponse);
    }

    @PreAuthorize("hasAuthority('CLASS_READ')")
    public List<ClassResponse> getClassesByTeacherId(String teacherId) {
        return classRepository.findByTeacher_UserId(teacherId).stream()
                .map(classMapper::toClassResponse).toList();
    }

    @PreAuthorize("hasAuthority('CLASS_READ')")
    public Page<ClassResponse> getClassesByTeacherId(String teacherId, Pageable pageable) {
        return classRepository.findByTeacher_UserId(teacherId, pageable)
                .map(classMapper::toClassResponse);
    }

    @PreAuthorize("hasAuthority('CLASS_READ')")
    public ClassResponse getClassById(String classId) {
        return classMapper.toClassResponse(classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED)));
    }

    @PreAuthorize("hasAuthority('CLASS_DELETE')")
    public void deleteClass(String classId) {
        EntityClass entityClass = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));
        if (entityClass.getStatus() == EntityClass.Status.CLOSED) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }
        entityClass.setStatus(EntityClass.Status.CLOSED);
        classRepository.save(entityClass);
    }

    @PreAuthorize("hasAuthority('CLASS_UPDATE')")
    public ClassResponse addStudents(String classId, List<String> studentIds) {
        EntityClass entityClass = findClassById(classId);
        if (isClosed(entityClass)) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }

        List<Student> students = studentRepository.findAllById(studentIds);

        if (students.size() != studentIds.size()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        students.removeIf(s -> entityClass.getStudents().contains(s));
        entityClass.getStudents().addAll(students);

        return classMapper.toClassResponse(classRepository.save(entityClass));
    }

    @PreAuthorize("hasAuthority('CLASS_UPDATE')")
    public ClassResponse removeStudents(String classId, String studentId) {
        EntityClass entityClass = findClassById(classId);
        if (isClosed(entityClass)) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        entityClass.getStudents().removeIf(s -> s.getUserId().equals(student.getUserId()));
        return classMapper.toClassResponse(classRepository.save(entityClass));
    }

    private boolean isClosed(EntityClass entityClass) {
        return  entityClass.getStatus() == EntityClass.Status.CLOSED;
    }

    private EntityClass findClassById(String classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));
    }
}
