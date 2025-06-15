package vn.edu.actvn.server.dto.request.user;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateParentRequest {
    String fullName;
    String email;

    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;
}