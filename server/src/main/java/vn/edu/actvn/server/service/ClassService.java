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

    public EntityClass getById(String id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));
    }

    public Page<ClassResponse> getClasses(String studentId,String teacherId,
                                          String className,Integer grade,Pageable pageable) {
        if(studentId == null) studentId ="";
        if(teacherId == null) teacherId = "";
        if(className == null) className = "";
        if(grade == null) grade = 0;
//        System.out.println("Searching classes with studentId: " + studentId +
//                ", teacherId: " + teacherId +
//                ", className: " + className +
//                ", grade: " + grade);
        return classRepository.search(studentId, teacherId, className, grade, pageable)
                .map(classMapper::toClassResponse);
    }

    @PreAuthorize("hasAuthority('CLASS_CREATE') || hasRole('ADMIN')")
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

    @PreAuthorize("hasAuthority('CLASS_UPDATE') || hasRole('ADMIN')")
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

    @PreAuthorize("hasAuthority('CLASS_READ') || hasRole('ADMIN')")
    public ClassResponse getClassById(String classId) {
        return classMapper.toClassResponse(classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED)));
    }

    @PreAuthorize("hasAuthority('CLASS_DELETE') || hasRole('ADMIN')")
    public void closeClass(String classId) {
        EntityClass entityClass = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));
        if (entityClass.getStatus() == EntityClass.Status.CLOSED) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }
        entityClass.setStatus(EntityClass.Status.CLOSED);
        classRepository.save(entityClass);
    }

    @PreAuthorize("hasAuthority('CLASS_UPDATE') || hasRole('ADMIN')")
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

    @PreAuthorize("hasAuthority('CLASS_UPDATE') || hasRole('ADMIN')")
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
