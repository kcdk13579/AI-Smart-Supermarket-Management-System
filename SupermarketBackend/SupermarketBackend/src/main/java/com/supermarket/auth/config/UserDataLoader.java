package com.supermarket.auth.config;

import com.supermarket.auth.entity.User;
import com.supermarket.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Seeds initial admin user on first run or database clear.
 */
@Component
public class UserDataLoader implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@smartmart.com";
    private static final String DEFAULT_PASSWORD = "admin123";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Optional<User> existingAdmin = userRepository.findByEmail(ADMIN_EMAIL);
        
        if (existingAdmin.isEmpty()) {
            User admin = new User(
                    "System Administrator",
                    ADMIN_EMAIL,
                    passwordEncoder.encode(DEFAULT_PASSWORD),
                    "ROLE_ADMIN"
            );
            userRepository.save(admin);
            System.out.println("Seeded system administrator: " + ADMIN_EMAIL + " / " + DEFAULT_PASSWORD);
        }
    }
}
