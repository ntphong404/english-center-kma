package vn.edu.actvn.server.dto.response.user;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.dto.response.role.RoleResponse;
import vn.edu.actvn.server.entity.ClassDiscount;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    String userId;
    String username;
    String fullName="";
    String email="";
    String gender="";
    String address="";
    String phoneNumber="";
    String avatarUrl="";

    LocalDate dob;
    String role;

    List<String> studentIds;
    Double salary;
    String parentId;
    List<ClassDiscount> classDiscounts;
}
