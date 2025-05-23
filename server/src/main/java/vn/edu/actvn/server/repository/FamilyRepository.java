package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.actvn.server.entity.Family;

import java.util.List;

public interface FamilyRepository extends JpaRepository<Family, String> {
    List<Family> findByParent_UserId(String parentId);
}
