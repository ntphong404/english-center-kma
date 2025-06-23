package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import vn.edu.actvn.server.dto.request.email.CreateOtp;
import vn.edu.actvn.server.dto.request.email.EmailRequest;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.repository.UserRepository;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    JavaMailSender mailSender;
    UserRepository userRepository;

    public void sendSimpleEmail(EmailRequest emailRequest) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailRequest.getTo());
        message.setSubject(emailRequest.getSubject());
        message.setText(emailRequest.getText());

        mailSender.send(message);
    }

    public void sendHtmlEmail(EmailRequest emailRequest) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(emailRequest.getTo());
            helper.setSubject(emailRequest.getSubject());
            helper.setText(emailRequest.getHtmlText(), true);
            try {
                mailSender.send(message);
            } catch (MailException e) {
                throw new AppException(ErrorCode.FAILED_TO_SEND_EMAIL);
            }
        }
        catch (MessagingException e) {
            throw new AppException(ErrorCode.FAILED_TO_SEND_EMAIL);
        }

    }

    public void sendEmail(EmailRequest emailRequest) throws MessagingException {
        if (emailRequest.isHtml()) {
            sendHtmlEmail(emailRequest);
        } else {
            sendSimpleEmail(emailRequest);
        }
    }

    public CreateOtp sendForgotPasswordEmail(String toEmail) {
        userRepository.findByEmail(toEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String otp = generateOTP();
        String subject = "Reset your password - OTP Verification";
        String htmlContent = buildForgotPasswordHtml(otp);

        try {
            sendHtmlEmail(toEmail, subject, htmlContent);
            return CreateOtp.builder().email(toEmail).otp(otp).build(); // Trả về OTP để lưu trữ
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.FAILED_TO_SEND_EMAIL);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String generateOTP() {
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000); // 6 chữ số
        return String.valueOf(otpValue);
    }

    private String buildForgotPasswordHtml(String otp) {
        return """
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #2c3e50;">Yêu cầu đặt lại mật khẩu</h2>
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
                        <p>Mã xác nhận (OTP) của bạn là:</p>
                        <h1 style="text-align: center; color: #e74c3c; letter-spacing: 8px;">%s</h1>
                        <p>Vui lòng nhập mã này trong vòng <strong>5 phút</strong> để tiếp tục quá trình đặt lại mật khẩu.</p>
                        <hr />
                        <p style="font-size: 12px; color: gray;">Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.</p>
                    </div>
                </div>
                """.formatted(otp);
    }
}