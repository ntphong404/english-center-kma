package vn.edu.actvn.server.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = GenderValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface GenderConstraint {
    String message() default "GENDER_INVALID";
    String[] acceptedValues() default {"MALE", "FEMALE"};
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}