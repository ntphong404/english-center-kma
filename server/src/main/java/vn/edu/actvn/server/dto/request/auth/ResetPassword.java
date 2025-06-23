package vn.edu.actvn.server.dto.request.auth;

public record ResetPassword(
    String email,
    String otpCode,
    String newPassword
) {
}
