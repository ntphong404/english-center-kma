package vn.edu.actvn.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(500, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(400, "Invalid key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(409, "User already exists", HttpStatus.CONFLICT),
    USERNAME_INVALID(400, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(400, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(404, "User not found", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(401, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "You do not have permission", HttpStatus.FORBIDDEN),

    INVALID_DOB(400, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(404, "Role not existed", HttpStatus.BAD_REQUEST),

    CLASS_NOT_EXISTED(404, "Class not existed", HttpStatus.BAD_REQUEST),
    CLASS_ALREADY_CLOSED(405, "Class already closed", HttpStatus.BAD_REQUEST),

    FAMILY_NOT_EXISTED(404, "Family not existed", HttpStatus.BAD_REQUEST),
    ATTENDANCE_NOT_EXISTED(404, "Attendance not existed", HttpStatus.BAD_REQUEST),

    STUDENT_ALREADY_ADDED(409,"Student already added" ,HttpStatus.BAD_REQUEST ),
    STUDENT_NOT_FOUND(404, "Student not found in this parent",HttpStatus.NOT_FOUND ),
    STUDENT_ALREADY_HAS_PARENT(400, "Student already has parent",HttpStatus.BAD_REQUEST ),

    TUITION_FEE_ALREADY_EXISTS(400,"Tuition fee already exists" ,HttpStatus.BAD_REQUEST ),
    TUITION_FEE_NOT_EXISTED(404, "Tuition fee not existed", HttpStatus.NOT_FOUND),

    ATTENDANCE_NOT_FOUND(404,"Attendance not found" ,HttpStatus.NOT_FOUND ),
    TODAY_NOT_VALID_FOR_ATTENDANCE(400,"Today not valid for attendance" ,HttpStatus.BAD_REQUEST ),
    FAILDED_TO_UPLOAD_IMAGE(400,"Failded to upload image" ,HttpStatus.BAD_REQUEST );

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}