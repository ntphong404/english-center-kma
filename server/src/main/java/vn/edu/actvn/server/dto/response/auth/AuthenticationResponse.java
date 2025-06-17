package vn.edu.actvn.server.dto.response.auth;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.dto.response.user.UserResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationResponse {
    UserResponse user;
    String accessToken;
    String refreshToken;
    boolean authenticated;
}
