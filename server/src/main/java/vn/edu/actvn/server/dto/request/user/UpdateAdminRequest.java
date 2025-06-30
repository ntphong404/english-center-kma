package vn.edu.actvn.server.dto.request.user;

import java.time.LocalDate;

import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;
import vn.edu.actvn.server.validator.GenderConstraint;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAdminRequest {
    String fullName;
    String email;
    @GenderConstraint
    String gender;
    String address;
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "INVALID_PHONE_NUMBER")
    String phoneNumber;
    String avatarUrl;

    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;
}