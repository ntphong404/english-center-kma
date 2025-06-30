package vn.edu.actvn.server.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public class GenderValidator implements ConstraintValidator<GenderConstraint, String> {
    private Set<String> acceptedValues;

    @Override
    public void initialize(GenderConstraint constraintAnnotation) {
        acceptedValues = Arrays.stream(constraintAnnotation.acceptedValues())
                .map(String::toUpperCase)
                .collect(Collectors.toSet());
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;
        return acceptedValues.contains(value.toUpperCase());
    }
}