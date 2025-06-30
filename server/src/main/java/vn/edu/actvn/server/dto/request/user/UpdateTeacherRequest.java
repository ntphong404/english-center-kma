package vn.edu.actvn.server.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;
import vn.edu.actvn.server.validator.GenderConstraint;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTeacherRequest {
    String fullName;
    @Email(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]")
    String email;
    @GenderConstraint
    String gender;
    String address;
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "INVALID_PHONE_NUMBER")
    String phoneNumber;
    String avatarUrl;

    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;

    BigDecimal salary;
}