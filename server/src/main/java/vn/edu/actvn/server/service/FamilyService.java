package vn.edu.actvn.server.service;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.CreateFamilyRequest;
import vn.edu.actvn.server.dto.response.FamilyResponse;
import vn.edu.actvn.server.entity.Family;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.FamilyMapper;
import vn.edu.actvn.server.repository.FamilyRepository;
import vn.edu.actvn.server.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FamilyService {

    FamilyRepository familyRepository;
    UserRepository userRepository;
    FamilyMapper familyMapper;

    public List<FamilyResponse> getFamilies() {;
        return familyRepository.findAll().stream()
                .map(familyMapper::toFamilyResponse)
                .toList();
    }

    public FamilyResponse getFamilyById(String id) {
        return familyMapper.toFamilyResponse(familyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Family not found")));
    }

    public List<FamilyResponse> getFamiliesByParentId(String parentId) {
        return familyRepository.findByParent_UserId(parentId).stream()
                .map(familyMapper::toFamilyResponse)
                .toList();
    }

    public FamilyResponse createFamily(CreateFamilyRequest createFamilyRequest) {
        Family family = Family.builder()
                .parent(userRepository.findById(createFamilyRequest.getParentId())
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)))
                .build();
        createFamilyRequest.getStudentIds().forEach(studentId -> {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            family.getStudents().add(student);
        });

        return familyMapper.toFamilyResponse(familyRepository.save(family));
    }

    public FamilyResponse updateFamily(String id, CreateFamilyRequest createFamilyRequest) {
        Family family = familyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FAMILY_NOT_EXISTED));
        family.setParent(userRepository.findById(createFamilyRequest.getParentId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        family.getStudents().clear();
        createFamilyRequest.getStudentIds().forEach(studentId -> {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            family.getStudents().add(student);
        });
        return familyMapper.toFamilyResponse(familyRepository.save(family));
    }

    public void deleteFamily(String id) {
        Family family = familyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FAMILY_NOT_EXISTED));
        familyRepository.delete(family);
    }

    public FamilyResponse addStudentToFamily(String familyId, List<String> studentId) {
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new AppException(ErrorCode.FAMILY_NOT_EXISTED));
        studentId.forEach(id -> {
            User student = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            if (family.getStudents().contains(student)) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
            family.getStudents().add(student);
        });
        return familyMapper.toFamilyResponse(familyRepository.save(family));
    }
}
