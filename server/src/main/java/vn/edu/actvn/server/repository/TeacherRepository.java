package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.actvn.server.entity.Teacher;

public interface TeacherRepository extends JpaRepository<Teacher, String> {
    // Additional query methods can be defined here
}