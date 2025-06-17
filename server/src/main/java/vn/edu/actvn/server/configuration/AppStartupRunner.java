package vn.edu.actvn.server.configuration;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.edu.actvn.server.constant.Permission;
import vn.edu.actvn.server.constant.PredefinedRole;
import vn.edu.actvn.server.entity.Role;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.repository.RoleRepository;
import vn.edu.actvn.server.repository.UserRepository;

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
                        // Create student role with permissions
                        Set<Permission> studentPermissions = new HashSet<>();
                        studentPermissions.add(Permission.STUDENT_READ);
                        studentPermissions.add(Permission.STUDENT_UPDATE);
                        studentPermissions.add(Permission.CLASS_READ);
                        studentPermissions.add(Permission.ATTENDANCE_READ);
                        studentPermissions.add(Permission.TUITION_FEE_READ);
                        studentPermissions.add(Permission.PAYMENT_READ);
                        studentPermissions.add(Permission.IMAGE_AVATAR_UPLOAD);

                        Role studentRole = Role.builder()
                                .name(PredefinedRole.STUDENT_ROLE)
                                .description("Student role")
                                .permissions(studentPermissions)
                                .build();
                        roleRepository.save(studentRole);

                        // Create teacher role with permissions
                        Set<Permission> teacherPermissions = new HashSet<>();
                        teacherPermissions.add(Permission.TEACHER_READ);
                        teacherPermissions.add(Permission.TEACHER_UPDATE);
                        teacherPermissions.add(Permission.CLASS_READ);
                        teacherPermissions.add(Permission.STUDENT_READ);
                        teacherPermissions.add(Permission.ATTENDANCE_READ);
                        teacherPermissions.add(Permission.ATTENDANCE_CREATE);
                        teacherPermissions.add(Permission.ATTENDANCE_UPDATE);
                        teacherPermissions.add(Permission.IMAGE_AVATAR_UPLOAD);

                        Role teacherRole = Role.builder()
                                .name(PredefinedRole.TEACHER_ROLE)
                                .description("Teacher role")
                                .permissions(teacherPermissions)
                                .build();
                        roleRepository.save(teacherRole);

                        // Create parent role with permissions
                        Set<Permission> parentPermissions = new HashSet<>();
                        parentPermissions.add(Permission.PARENT_READ);
                        parentPermissions.add(Permission.PARENT_UPDATE);
                        parentPermissions.add(Permission.STUDENT_READ);
                        parentPermissions.add(Permission.CLASS_READ);
                        parentPermissions.add(Permission.ATTENDANCE_READ);
                        parentPermissions.add(Permission.TUITION_FEE_READ);
                        parentPermissions.add(Permission.PAYMENT_READ);
                        parentPermissions.add(Permission.PARENT_CREATE);
                        parentPermissions.add(Permission.IMAGE_AVATAR_UPLOAD);
                        parentPermissions.add(Permission.TUITION_FEE_READ_ALL);

                        Role parentRole = Role.builder()
                                .name(PredefinedRole.PARENT_ROLE)
                                .description("Parent role")
                                .permissions(parentPermissions)
                                .build();
                        roleRepository.save(parentRole);

                        // Create admin role with all permissions
                        Set<Permission> adminPermissions = new HashSet<>(Arrays.asList(Permission.values()));

                        Role adminRole = Role.builder()
                                .name(PredefinedRole.ADMIN_ROLE)
                                .description("Admin role")
                                .permissions(adminPermissions)
                                .build();
                        roleRepository.save(adminRole);

                        User user = User.builder()
                                .username(ADMIN_USER_NAME)
                                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                                .fullName("Admin")
                                .email("englishcenter@gmail.com")
                                .dob(LocalDate.of(2000, 1, 1))
                                .role(adminRole)
                                .build();

                        userRepository.save(user);
                        log.warn("admin user has been created with default password: admin, please change it");
                }

                log.warn("Application initialization completed .....");
        }
}
