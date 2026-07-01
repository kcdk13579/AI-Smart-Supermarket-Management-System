package com.supermarket.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

import com.supermarket.auth.dto.*;
import com.supermarket.auth.entity.User;
import com.supermarket.auth.repository.UserRepository;
import com.supermarket.auth.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    private static final List<String> ALLOWED_REGISTRATION_ROLES =
            List.of("ROLE_CUSTOMER");

    public void register(RegisterRequest request) {
        String role = request.role != null && request.role.isBlank() == false
                ? request.role.trim()
                : "ROLE_CUSTOMER";
        if (!ALLOWED_REGISTRATION_ROLES.contains(role)) {
            role = "ROLE_CUSTOMER";
        }
        User user = new User(
                request.name,
                request.email,
                passwordEncoder.encode(request.password),
                role
        );
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email, request.password));

        User user = userRepository.findByEmail(request.email).get();
        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole());

        return new AuthResponse(token, user.getRole());
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserProfileResponse(user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.email != null && !request.email.isBlank() && !request.email.equals(currentEmail)) {
            if (userRepository.findByEmail(request.email).isPresent()) {
                throw new RuntimeException("Email is already in use");
            }
            user.setEmail(request.email.trim());
        }

        if (request.name != null && !request.name.isBlank()) {
            user.setName(request.name.trim());
        }

        userRepository.save(user);

        // Generate a new token if the email (subject) changed.
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getRole());
    }
}
