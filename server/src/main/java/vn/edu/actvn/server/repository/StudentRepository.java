package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.actvn.server.entity.Student;

public interface StudentRepository extends JpaRepository<Student, String> {
    // Additional query methods can be defined here
}