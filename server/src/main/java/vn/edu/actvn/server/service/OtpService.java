package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.email.CreateOtp;
import vn.edu.actvn.server.entity.Otp;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.repository.OtpRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class OtpService {

    OtpRepository otpRepository;

    public void verifyOtp(String email , String otpCode) {
        Otp otp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));
        if (otp.isUsed() || !otp.getOtpCode().equals(otpCode) || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }
    }

    public void setUsedOtp(String email) {
        Otp otp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));
        otp.setUsed(true);
        otpRepository.save(otp);
    }

    public void createOtp(CreateOtp createOtp) {
        if (otpRepository.findByEmail(createOtp.getEmail()).isPresent()) {
            deleteOtp(createOtp.getEmail());
        }
        Otp otp = Otp.builder()
                .email(createOtp.getEmail())
                .otpCode(createOtp.getOtp())
                .isUsed(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))// 5 minutes expiration
                .build();
        otpRepository.save(otp);
    }

    public void deleteOtp(String email) {
        Otp otp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));
        otpRepository.delete(otp);
    }
}
