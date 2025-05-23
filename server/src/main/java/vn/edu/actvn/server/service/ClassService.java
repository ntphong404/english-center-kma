package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.ClassUpdateRequest;
import vn.edu.actvn.server.dto.request.CreateClassRequest;
import vn.edu.actvn.server.dto.response.ClassResponse;
import vn.edu.actvn.server.entity.EntityClass;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.ClassMapper;
import vn.edu.actvn.server.repository.ClassRepository;
import vn.edu.actvn.server.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ClassService {

    ClassRepository classRepository;
    UserRepository userRepository;
    ClassMapper classMapper;

    public ClassResponse createClass(CreateClassRequest createClassRequest) {
        EntityClass entityClass = classMapper.toEntityClass(createClassRequest);
        User teacher = userRepository.findById(createClassRequest.getTeacherId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        entityClass.setTeacher(teacher);
        entityClass.setStatus(EntityClass.Status.OPEN);
        entityClass.setStudents(new ArrayList<>());
        return classMapper.toClassResponse(classRepository.save(entityClass));
    }

    public ClassResponse addStudents(String classId, List<String> studentIds) {
        EntityClass entityClass = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));

        if (entityClass.getStatus() == EntityClass.Status.CLOSED) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }

        List<User> students = userRepository.findAllById(studentIds);

        if (students.size() != studentIds.size()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        students.removeIf(s -> entityClass.getStudents().contains(s));
        entityClass.getStudents().addAll(students);

        return classMapper.toClassResponse(classRepository.save(entityClass));
    }


    public ClassResponse updateClass(String classId, ClassUpdateRequest classUpdateRequest) {
        EntityClass entityClass = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));
        if (entityClass.getStatus() == EntityClass.Status.CLOSED) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }
        entityClass = classMapper.updateEntityClass(classUpdateRequest, entityClass);
        return classMapper.toClassResponse(classRepository.save(entityClass));
    }

    public List<ClassResponse> getClasses() {
        List<ClassResponse> classResponses = new ArrayList<>();
        for (EntityClass entityClass : classRepository.findAll()) {
            ClassResponse classResponse = classMapper.toClassResponse(entityClass);
            classResponses.add(classResponse);
        }
        return classResponses;
    }

    public List<ClassResponse> getClassesByTeacherId(String teacherId) {
        List<ClassResponse> classResponses = new ArrayList<>();
        List<EntityClass> entityClasses = classRepository.findByTeacher_UserId(teacherId);
        for (EntityClass entityClass : entityClasses) {
            ClassResponse classResponse = classMapper.toClassResponse(entityClass);
            classResponses.add(classResponse);
        }
        return classResponses;
    }

    public ClassResponse getClassById(String classId) {
        return classMapper.toClassResponse(classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED)));
    }

    public void deleteClass(String classId) {
        EntityClass entityClass = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_EXISTED));
        if (entityClass.getStatus() == EntityClass.Status.CLOSED) {
            throw new AppException(ErrorCode.CLASS_ALREADY_CLOSED);
        }
        entityClass.setStatus(EntityClass.Status.CLOSED);
        classRepository.save(entityClass);
    }

}
