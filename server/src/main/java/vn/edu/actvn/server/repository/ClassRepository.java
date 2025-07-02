package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.EntityClass;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<EntityClass, String> {
    @Query("""
        SELECT ec FROM EntityClass ec
        WHERE (LOWER(ec.className) LIKE LOWER(CONCAT('%', :className, '%')))
          AND (:grade = 0 or ec.grade = :grade)
          AND (LOWER(ec.teacher.userId) LIKE LOWER(CONCAT('%', :teacherId, '%')))
              AND (:status IS NULL OR ec.status = :status)
          AND (:studentId = "" OR EXISTS (
              SELECT 1 FROM ec.students s WHERE (LOWER(s.userId) LIKE LOWER(CONCAT('%', :studentId, '%')))
          ))
    """)
    Page<EntityClass> search(
         @Param("studentId") String studentId,
         @Param("teacherId") String teacherId,
         @Param("className") String className,
         @Param("grade") Integer grade,
         @Param("status") EntityClass.Status status,
         Pageable pageable);

    List<EntityClass> findByStatus(EntityClass.Status status);
}
