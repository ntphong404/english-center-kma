package vn.edu.actvn.server.mapper;

import org.mapstruct.*;
import vn.edu.actvn.server.dto.request.banner.CreateBannerCourseRequest;
import vn.edu.actvn.server.dto.request.banner.UpdateBannerCourseRequest;
import vn.edu.actvn.server.dto.response.banner.BannerCourseResponse;
import vn.edu.actvn.server.entity.BannerCourse;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BannerCourseMapper {
    BannerCourse toBannerCourse(CreateBannerCourseRequest request);
    BannerCourseResponse toBannerCourseResponse(BannerCourse bannerCourse);
    @Mapping(target = "bannerCourseId", ignore = true)
    void updateBannerCourse(UpdateBannerCourseRequest request, @MappingTarget BannerCourse bannerCourse);
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "bannerCourseId", ignore = true)
    void patchBannerCourse(UpdateBannerCourseRequest request, @MappingTarget BannerCourse bannerCourse);
}

