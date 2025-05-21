package vn.edu.actvn.server.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.edu.actvn.server.constant.PredefinedRole;
import vn.edu.actvn.server.entity.Role;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.repository.RoleRepository;
import vn.edu.actvn.server.repository.UserRepository;

import java.util.HashSet;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppStartupRunner implements CommandLineRunner {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;

        private static final String ADMIN_USER_NAME = "admin";
        private static final String ADMIN_PASSWORD = "admin";

        @Override
        public void run(String... args) {
                log.warn("Initializing application.....");

                if (userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                        roleRepository.save(Role.builder()
                                        .name(PredefinedRole.STUDENT_ROLE)
                                        .description("User role")
                                        .build());
                        roleRepository.save(Role.builder()
                                        .name(PredefinedRole.TEACHER_ROLE)
                                        .description("Teacher role")
                                        .build());
                        roleRepository.save(Role.builder()
                                        .name(PredefinedRole.PARENT_ROLE)
                                        .description("Parent role")
                                        .build());

                        Role adminRole = roleRepository.save(Role.builder()
                                        .name(PredefinedRole.ADMIN_ROLE)
                                        .description("Admin role")
                                        .build());

                        User user = User.builder()
                                        .username(ADMIN_USER_NAME)
                                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                                        .role(adminRole)
                                        .build();

                        userRepository.save(user);
                        log.warn("admin user has been created with default password: admin, please change it");
                }

                log.warn("Application initialization completed .....");
        }
}
