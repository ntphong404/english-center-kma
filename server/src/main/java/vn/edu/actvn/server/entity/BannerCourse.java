package vn.edu.actvn.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class BannerCourse {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    String bannerCourseId;
    @Column(nullable = false, length = 100)
    String title;
    String description;
    @Column(nullable = false, length = 500)
    String imageUrl;
    String publicId;
}
