package vn.edu.actvn.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.actvn.server.entity.Otp;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp,String> {
    Optional<Otp> findByEmail(String email);
}
