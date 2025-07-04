package vn.edu.actvn.server.dto.response.notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        String notificationId,
        String recipientName,
        String subject,
        String content,
        LocalDateTime sentAt
) {
}
