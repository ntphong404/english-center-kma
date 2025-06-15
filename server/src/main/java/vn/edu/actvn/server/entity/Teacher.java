package vn.edu.actvn.server.entity;

import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Teacher extends User {
    BigDecimal salary;

//    String bankAccount;
//    String bankName;
//
//    String certificate;
//    String yearOfExperience;
}
