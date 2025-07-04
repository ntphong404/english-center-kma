package vn.edu.actvn.server.dto.request.email;

public record SendToParentRequest (
    String parentId,
    String subject,
    String content
){}
