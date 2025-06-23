package vn.edu.actvn.server.dto.request.user;

import java.time.LocalDate;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.validator.DobConstraint;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAdminRequest {
    String fullName;
    String email;
    String gender;
    String address;
    String phoneNumber;
    String avatarUrl;

    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;
}