package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.actvn.server.entity.Teacher;

public interface TeacherRepository extends JpaRepository<Teacher, String> {
    // Additional query methods can be defined here

    @Query("""
        SELECT t FROM Teacher t 
        WHERE LOWER(t.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')) 
        AND LOWER(t.email) LIKE LOWER(CONCAT('%', :email, '%'))
    """)
    Page<Teacher> search(@Param("fullName") String fullName,@Param("email") String email, Pageable pageable);
}

