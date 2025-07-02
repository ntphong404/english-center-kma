package vn.edu.actvn.server.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.intellij.lang.annotations.RegExp;
import vn.edu.actvn.server.entity.ClassDiscount;
import vn.edu.actvn.server.validator.DobConstraint;
import vn.edu.actvn.server.validator.GenderConstraint;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateStudentRequest {
    String fullName;
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
    private String email;
    @GenderConstraint
    String gender;
    String address;
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "INVALID_PHONE_NUMBER")
    String phoneNumber;
    String avatarUrl;
    @DobConstraint
    LocalDate dob;

    List<ClassDiscount> classDiscounts;
}