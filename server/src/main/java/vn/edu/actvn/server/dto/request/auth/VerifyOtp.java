package vn.edu.actvn.server.dto.request.auth;

public record VerifyOtp(
    String email,
    String otpCode ) {
}
