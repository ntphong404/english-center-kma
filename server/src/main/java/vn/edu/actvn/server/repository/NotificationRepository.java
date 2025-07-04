package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,String> {
}
