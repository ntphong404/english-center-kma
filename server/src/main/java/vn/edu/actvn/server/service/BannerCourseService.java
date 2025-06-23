package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.banner.CreateBannerCourseRequest;
import vn.edu.actvn.server.dto.request.banner.UpdateBannerCourseRequest;
import vn.edu.actvn.server.dto.response.banner.BannerCourseResponse;
import vn.edu.actvn.server.entity.BannerCourse;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.BannerCourseMapper;
import vn.edu.actvn.server.repository.BannerCourseRepository;
import vn.edu.actvn.server.service.ImageUploadService;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BannerCourseService {
    BannerCourseRepository bannerCourseRepository;
    BannerCourseMapper bannerCourseMapper;
    ImageUploadService imageUploadService;

    public List<BannerCourseResponse> getAllBannerCourses() {
        return bannerCourseRepository.findAll().stream()
                .map(bannerCourseMapper::toBannerCourseResponse)
                .toList();
    }

    public Page<BannerCourseResponse> getAllBannerCourses(Pageable pageable) {
        return bannerCourseRepository.findAll(pageable)
                .map(bannerCourseMapper::toBannerCourseResponse);
    }

    @PreAuthorize("hasAuthority('BANNER_READ') || hasRole('ADMIN')")
    public BannerCourseResponse getBannerCourseById(String id) {
        BannerCourse bannerCourse = bannerCourseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return bannerCourseMapper.toBannerCourseResponse(bannerCourse);
    }

    @PreAuthorize("hasAuthority('BANNER_CREATE') || hasRole('ADMIN')")
    public BannerCourseResponse createBannerCourse(CreateBannerCourseRequest request) {
        BannerCourse bannerCourse = bannerCourseMapper.toBannerCourse(request);
        return bannerCourseMapper.toBannerCourseResponse(bannerCourseRepository.save(bannerCourse));
    }

    @PreAuthorize("hasAuthority('BANNER_UPDATE') || hasRole('ADMIN')")
    public BannerCourseResponse patchBannerCourse(String id, UpdateBannerCourseRequest request) {
        BannerCourse bannerCourse = bannerCourseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (request.getImageUrl() != null && bannerCourse.getPublicId() != null) {
            imageUploadService.deleteImageByPublicId(bannerCourse.getPublicId());
        }

        bannerCourseMapper.patchBannerCourse(request, bannerCourse);
        return bannerCourseMapper.toBannerCourseResponse(bannerCourseRepository.save(bannerCourse));
    }


    @PreAuthorize("hasAuthority('BANNER_DELETE') || hasRole('ADMIN')")
    public void deleteBannerCourse(String id) {
        BannerCourse bannerCourse = bannerCourseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (bannerCourse.getPublicId() != null && !bannerCourse.getPublicId().isEmpty()) {
            imageUploadService.deleteImageByPublicId(bannerCourse.getPublicId());
        }
        bannerCourseRepository.deleteById(id);
    }

    @PreAuthorize("hasAuthority('BANNER_READ') || hasRole('ADMIN')")
    public Page<BannerCourseResponse> searchBannerCourses(String title, String description, Pageable pageable) {
        if (title != null) title = title.trim();
        if (description != null) description = description.trim();
        boolean isTitleEmpty = (title == null || title.isEmpty());
        boolean isDescriptionEmpty = (description == null || description.isEmpty());
        if (isTitleEmpty) title = "";
        if (isDescriptionEmpty) description = "";
        return bannerCourseRepository.searchByKeyword(title, description, pageable)
                .map(bannerCourseMapper::toBannerCourseResponse);
    }
}

