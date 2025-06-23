package vn.edu.actvn.server.dto.request.user;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTeacherRequest {
    String fullName;
    String email;
    String gender;
    String address;
    String phoneNumber;
    String avatarUrl;

    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;

    BigDecimal salary;
}