package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.actvn.server.entity.Parent;

public interface ParentRepository extends JpaRepository<Parent, String> {
    // Additional query methods can be defined here

    @Query("""
        SELECT p FROM Parent p
            WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')) 
                AND LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%'))
    """)
    Page<Parent> search(@Param("fullName") String fullName,@Param("email") String email, Pageable pageable);
}

