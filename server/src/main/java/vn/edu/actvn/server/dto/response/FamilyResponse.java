package vn.edu.actvn.server.dto.response;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.entity.User;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FamilyResponse {
    String familyId;
    UserResponse parent;
    List<UserResponse> students;
}
