package vn.edu.actvn.server.dto.request;

import java.time.LocalDate;
import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    String fullName;
    String email;

    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;

    String role;
}
