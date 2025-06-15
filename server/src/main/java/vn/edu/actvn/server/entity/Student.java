package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Student extends User {
    String parentId;

    @ElementCollection
    @CollectionTable(name = "student_class_discounts", joinColumns = @JoinColumn(name = "student_id"))
    List<ClassDiscount> classDiscounts;
}
