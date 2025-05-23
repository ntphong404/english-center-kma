package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.EntityClass;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<EntityClass, String> {
    List<EntityClass> findByTeacher_UserId(String teacherId);
}
