package vn.edu.actvn.server.dto.response.banner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerCourseResponse {
    private String bannerCourseId;
    private String title;
    private String description;
    private String imageUrl;
    private String publicId;
}

