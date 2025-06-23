package vn.edu.actvn.server.service;

import com.cloudinary.Cloudinary;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.actvn.server.dto.response.upload.UploadResponse;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;

import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageUploadService {

    Cloudinary cloudinary;

    @PreAuthorize("hasAuthority('IMAGE_AVATAR_UPLOAD') || hasRole('ADMIN')")
    public UploadResponse uploadAvatar(MultipartFile file) {
        return uploadImage(file, "english-center/avatars");
    }

    @PreAuthorize("hasAuthority('IMAGE_BANNER_UPLOAD') || hasRole('ADMIN')")
    public UploadResponse uploadBanner(MultipartFile file) {
        return uploadImage(file, "english-center/banners");
    }

    private UploadResponse uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> options = Map.of("folder", folder);

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            return UploadResponse.builder()
                    .publicId(result.get("public_id").toString())
                    .url(result.get("url").toString())
                    .secureUrl(result.get("secure_url").toString())
                    .format(result.get("format").toString())
                    .width((Integer) result.get("width"))
                    .height((Integer) result.get("height"))
                    .bytes(Long.parseLong(result.get("bytes").toString()))
                    .originalFilename(result.get("original_filename").toString())
                    .build();

        } catch (Exception e) {
            throw new AppException(ErrorCode.FAILED_TO_UPLOAD_IMAGE);
        }
    }

    public void deleteImageByPublicId(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, Map.of());
        } catch (Exception e) {
            throw new AppException(ErrorCode.FAILED_TO_UPLOAD_IMAGE);
        }
    }
}
