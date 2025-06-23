package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String otpId;

    String email;

    String otpCode;

    boolean isUsed;

    LocalDateTime createdAt;

    LocalDateTime expiresAt;
}
