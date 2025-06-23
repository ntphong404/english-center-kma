package vn.edu.actvn.server.dto.response.upload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    private String publicId;
    private String url;
    private String secureUrl;
    private String format;
    private Integer width;
    private Integer height;
    private Long bytes;
    private String originalFilename;
}
