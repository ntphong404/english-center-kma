package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String notificationId;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    Parent recipient;

    @Column(nullable = false, columnDefinition = "TEXT")
    String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @CreatedDate
    LocalDateTime sentAt;

}
