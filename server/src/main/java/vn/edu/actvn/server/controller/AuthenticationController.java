package vn.edu.actvn.server.controller;

import java.text.ParseException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nimbusds.jose.JOSEException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.dto.request.*;
import vn.edu.actvn.server.dto.response.ApiResponse;
import vn.edu.actvn.server.dto.response.AuthenticationResponse;
import vn.edu.actvn.server.dto.response.IntrospectResponse;
import vn.edu.actvn.server.service.AuthenticationService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Authentication API", description = "Endpoints for user login, token management, and logout")
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    @Operation(summary = "Login with username and password")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .message("User authenticated successfully")
                .build();
    }

    @PostMapping("/introspect")
    @Operation(summary = "Check validity of access token")
    public ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .message("Token introspection result")
                .build();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .message("Token refreshed successfully")
                .build();
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke tokens")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request)
            throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .message("User logged out successfully")
                .build();
    }

    @PostMapping("/clear")
    @Operation(summary = "Clear all tokens from database")
    public ApiResponse<Integer> clear() {
        int rawDeleted = authenticationService.clearTokenDatabase();
        return ApiResponse.<Integer>builder()
                .result(rawDeleted)
                .message("Token database cleared")
                .build();
    }
}
