package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.actvn.server.entity.InvalidatedToken;

import java.sql.Date;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
    int deleteByTypeAndExpiryTimeBefore(String type, Date date);
}
