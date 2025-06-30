package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    // Additional query methods can be defined here
    @Query("""
        SELECT s FROM Student s
            WHERE LOWER(s.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))
                AND LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%'))
    """)
    Page<Student> search(@Param("fullName") String fullName, @Param("email") String email, Pageable pageable);

//    Page<Student> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);

}