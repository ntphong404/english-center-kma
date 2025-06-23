package vn.edu.actvn.server.dto.request.user;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAdminRequest {
    @Size(min = 4, message = "USERNAME_INVALID")
    String username;

    @Size(min = 6, message = "INVALID_PASSWORD")
    String password;

    String fullName;
    String email;
    String gender;
    String address;
    String phoneNumber;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;
}
