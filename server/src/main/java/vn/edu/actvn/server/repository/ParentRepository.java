package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.actvn.server.entity.Parent;

public interface ParentRepository extends JpaRepository<Parent, String> {
    // Additional query methods can be defined here
}