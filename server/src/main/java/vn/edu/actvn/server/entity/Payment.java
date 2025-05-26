package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String paymentId;

    LocalDate paymentDate;

    @ManyToOne
    @JoinColumn(name = "tuition_fee_id")
    TuitionFee tuitionFee;

    @ManyToOne
    @JoinColumn(name = "student_id")
    User student;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    User parent;

    @CreatedDate
    LocalDateTime createdAt;

    @LastModifiedDate
    LocalDateTime updatedAt;
}

/*
📌 1. Tạo học phí cho học sinh
POST /api/tuition-fees

📌 2. Lấy học phí của học sinh theo tháng
GET /api/tuition-fees?studentId=123&month=5&year=2025

📌 3. Ghi nhận đóng học phí
POST /api/payments

📌 4. Danh sách nợ học phí của 1 học sinh
GET /api/tuition-fees/debts?studentId=123

📌 5. Thống kê doanh thu theo tháng / quý / năm
GET /api/statistics/revenue?from=2025-01-01&to=2025-05-31

📌 6. Thống kê công nợ theo lớp
GET /api/statistics/debt-by-class?month=5&year=2025

📌 7. Gửi tin nhắn cảnh báo nợ học phí
POST /api/notifications/tuition-alert
*/