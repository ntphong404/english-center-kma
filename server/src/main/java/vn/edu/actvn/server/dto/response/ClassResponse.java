package vn.edu.actvn.server.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassResponse {
    String classId;
    String className;
    Integer year;
    String status;
    UserResponse teacher;
    List<UserResponse> students;
}
