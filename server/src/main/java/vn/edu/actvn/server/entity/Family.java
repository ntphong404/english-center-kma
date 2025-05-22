package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Family {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int familyId;

    @OneToOne
    @JoinColumn(name = "parent_id", referencedColumnName = "userId")
    User parent;

    @OneToMany
    @JoinColumn(name = "family_id")
    List<User> students;
}
