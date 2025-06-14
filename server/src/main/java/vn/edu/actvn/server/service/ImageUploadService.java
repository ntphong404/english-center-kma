package vn.edu.actvn.server.service;

import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;

import java.io.IOException;
import java.util.Map;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;

    public ImageUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String upload(MultipartFile file) {
        try {
            Map<String, Object> options = Map.of(
                    "folder", "english-center/avatar"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return result.get("secure_url").toString();
        } catch (Exception e) {
            throw new AppException(ErrorCode.FAILDED_TO_UPLOAD_IMAGE);
        }
    }
}
