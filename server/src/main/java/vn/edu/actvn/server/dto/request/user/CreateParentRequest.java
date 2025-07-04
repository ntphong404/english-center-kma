package vn.edu.actvn.server.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;
import vn.edu.actvn.server.validator.GenderConstraint;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateParentRequest {
    @Size(min = 4, message = "USERNAME_INVALID")
    String username;

    @Size(min = 6, message = "INVALID_PASSWORD")
    String password;

    String fullName;
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
    String email;

    @GenderConstraint
    @NotBlank
    String gender;
    String address;
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "INVALID_PHONE_NUMBER")
    String phoneNumber;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;
}
