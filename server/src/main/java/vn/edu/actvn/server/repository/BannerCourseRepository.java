package vn.edu.actvn.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.BannerCourse;

@Repository
public interface BannerCourseRepository extends JpaRepository<BannerCourse, String> {
    @Query("""
        SELECT b FROM BannerCourse b
        WHERE (:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')))
          AND (:description IS NULL OR LOWER(b.description) LIKE LOWER(CONCAT('%', :description, '%')))
    """)
    Page<BannerCourse> searchByKeyword(@Param("title") String title, @Param("description") String description, Pageable pageable);
}


