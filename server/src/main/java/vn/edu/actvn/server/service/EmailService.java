package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import vn.edu.actvn.server.dto.request.email.CreateOtp;
import vn.edu.actvn.server.dto.request.email.EmailRequest;
import vn.edu.actvn.server.entity.*;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    JavaMailSender mailSender;
    UserRepository userRepository;
    ParentRepository parentRepository;
    AttendanceRepository attendanceRepository;
    TuitionFeeRepository tuitionFeeRepository;
    StudentRepository studentRepository;
    ClassRepository classRepository;
    private final NotificationRepository notificationRepository;

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

    @PreAuthorize("hasRole('ADMIN')")
    @Scheduled(cron = "0 0 0 1 * *")
    public void sendReportToParent() {
        log.info("Sending report to all parents");
        parentRepository.findAll().forEach(parent -> {
            String parentEmail = parent.getEmail();
            if (parentEmail != null && !parentEmail.isEmpty()) {
                try {
                    sendHtmlEmail(parentEmail, "Tình hình học tập của con: ", buildReportHtml(parent));
                } catch (MessagingException e) {
                    throw new RuntimeException(e);
                }
            } else {
                log.warn("Parent with ID {} does not have a valid email address.", parent.getUserId());
            }
        });
    }

    private String buildReportHtml(Parent parent) {
        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family: Arial, sans-serif;'><h2>Báo cáo học tập của các con</h2>");
        html.append("<table border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; width: 100%;'>");
        html.append("<tr style='background: #f2f2f2;'><th>Họ tên</th><th>Lớp</th><th>Đi học</th><th>Nghỉ</th><th>Đã trả</th><th>Còn nợ</th></tr>");

        if (parent.getStudentIds() != null) {
            for (String studentId : parent.getStudentIds()) {
                var studentOpt = studentRepository.findById(studentId);
                if (studentOpt.isEmpty()) continue;
                var student = studentOpt.get();

                // Tìm lớp của học sinh
                var classes = classRepository.search(studentId, "", "", 0, EntityClass.Status.OPEN, PageRequest.of(0, 1000));
                var classList = classes.getContent();
                int numClasses = classList.size();
                if (numClasses == 0) continue;

                for (int i = 0; i < numClasses; i++) {
                    var classEntity = classList.get(i);
                    String className = classEntity.getClassName();
                    String classId = classEntity.getClassId();

                    // Thống kê điểm danh
                    long present = 0, absent = 0;
                    if (classId != null) {
                        present = attendanceRepository.countByEntityClass_ClassIdAndStudentAttendances_StudentIdAndStudentAttendances_Status(classId, studentId, Attendance.Status.PRESENT);
                        absent = attendanceRepository.countByEntityClass_ClassIdAndStudentAttendances_StudentIdAndStudentAttendances_Status(classId, studentId, Attendance.Status.ABSENT);
                    }

                    // Thống kê học phí
                    List<TuitionFee> fees = tuitionFeeRepository.search(studentId, classId, LocalDate.of(2025, 6, 1), PageRequest.of(0, 12)).getContent();
                    BigDecimal paid = BigDecimal.ZERO;
                    BigDecimal debt = BigDecimal.ZERO;
                    for (var fee : fees) {
                        paid = paid.add(fee.getAmount().subtract(fee.getRemainingAmount()));
                        debt = debt.add(fee.getRemainingAmount());
                    }

                    html.append("<tr>");
                    if (i == 0) {
                        // Chỉ render tên học sinh 1 lần với rowspan = số lớp
                        html.append("<td rowspan='").append(numClasses).append("'>").append(student.getFullName()).append("</td>");
                    }
                    html.append("<td>").append(className).append("</td>")
                            .append("<td>").append(present).append("</td>")
                            .append("<td>").append(absent).append("</td>")
                            .append("<td>").append(paid).append("</td>")
                            .append("<td>").append(debt).append("</td>")
                            .append("</tr>");
                }
            }
        }

        html.append("</table></div>");
        return html.toString();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void sendImportantInfo(String toParentId, String subject, String content) {
        System.out.printf("Sending important info to parent with ID: %s, subject: %s, content: %s%n", toParentId, subject, content);

        Parent parent = parentRepository.findById(toParentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String name = parent.getFullName();
        String email = parent.getEmail();
        if (email == null || email.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        String htmlContent = buildImportantInfoHtml(name, content);

        EmailRequest emailRequest = EmailRequest.builder()
                .to(email)
                .subject(subject)
                .htmlText(htmlContent)
                .build();

        sendHtmlEmail(emailRequest);
        notificationRepository.save(
                Notification.builder()
                        .recipient(parent)
                        .subject(subject)
                        .content(content)
                        .build()
        );
    }

    private String buildImportantInfoHtml(String subject, String content) {
        return """
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f2f5;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <h2 style="color: #d63031; margin-bottom: 20px;">Thông báo khẩn từ Trung tâm</h2>
                <p style="font-size: 16px; color: #2d3436; margin-bottom: 10px;"><strong>Gửi đến:</strong> %s</p>
                <div style="font-size: 15px; color: #2d3436; line-height: 1.6; margin-top: 15px;">
                    %s
                </div>
                <p style="margin-top: 30px; font-size: 14px; color: #636e72;">Vui lòng phản hồi sớm nếu có bất kỳ thắc mắc nào.</p>
            </div>
        </div>
        """.formatted(subject, content.replace("\n", "<br/>"));
    }

}

