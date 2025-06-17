package vn.edu.actvn.server.service;

import com.cloudinary.Cloudinary;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;

import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class ImageUploadService {
    Cloudinary cloudinary;

    @PreAuthorize("hasAuthority('IMAGE_AVATAR_UPLOAD')")
    public String uploadAvatar(MultipartFile file) {
        try {
            Map<String, Object> options = Map.of(
                    "folder", "english-center/avatars"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return result.get("secure_url").toString();
        } catch (Exception e) {
            throw new AppException(ErrorCode.FAILED_TO_UPLOAD_IMAGE);
        }
    }

    @PreAuthorize("hasAuthority('IMAGE_BANNER_UPLOAD')")
    public String uploadBanner(MultipartFile file) {
        try {
            Map<String, Object> options = Map.of(
                    "folder", "english-center/banners"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return result.get("secure_url").toString();
        } catch (Exception e) {
            throw new AppException(ErrorCode.FAILED_TO_UPLOAD_IMAGE);
        }
    }
}
