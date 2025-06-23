package vn.edu.actvn.server.dto.request.banner;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBannerCourseRequest {
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;
    private String description;
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    private String publicId;
}

