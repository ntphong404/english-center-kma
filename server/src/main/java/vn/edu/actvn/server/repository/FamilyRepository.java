package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Family;

import java.util.List;

@Repository
public interface FamilyRepository extends JpaRepository<Family, String> {
    List<Family> findByParent_UserId(String parentId);
}
