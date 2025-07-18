package vn.edu.actvn.server.dto.response.user;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
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
    @JsonSerialize(using = ToStringSerializer.class)
    BigDecimal salary;
    String parentId;
    List<ClassDiscount> classDiscounts;
}
