package vn.edu.actvn.server.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.edu.actvn.server.dto.response.notification.NotificationResponse;
import vn.edu.actvn.server.entity.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "recipientName", source = "recipient.fullName")
    NotificationResponse toNotificationResponse(Notification notification);
}
