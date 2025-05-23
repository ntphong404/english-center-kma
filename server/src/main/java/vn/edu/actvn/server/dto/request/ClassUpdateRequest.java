package vn.edu.actvn.server.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassUpdateRequest {
    String className;
    Integer year;
    String status;
}
