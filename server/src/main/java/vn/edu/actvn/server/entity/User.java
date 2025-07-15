package vn.edu.actvn.server.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@SuperBuilder
@Entity
@EntityListeners(AuditingEntityListener.class)
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String userId;

    String username;
    String password;
    String fullName;

//    @Formula("SUBSTRING_INDEX(full_name, ' ', -1)") // This is MySQL syntax, not supported by JPA/Hibernate
    @Setter(AccessLevel.NONE)
    @Formula("reverse(split_part(reverse(full_name), ' ', 1))") // PostgreSQL syntax for last name extraction
    String lastName;

    LocalDate dob;
    String email;
    String gender="";
    String address="";
    String phoneNumber="";
    String avatarUrl="";
    String publicId="";

    @ManyToOne
    @JoinColumn(name = "role_name")
    Role role;

    @CreatedDate
    LocalDateTime createdAt;

    @LastModifiedDate
    LocalDateTime updatedAt;
}
