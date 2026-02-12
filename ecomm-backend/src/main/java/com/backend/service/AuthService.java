package com.backend.service;

import com.backend.model.User;
import com.backend.repo.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public String signup(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Username already exists";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setLoyaltyPoints(100); // Signup bonus
        userRepository.save(user);
        return "Signup successful! Welcome bonus: 100 loyalty points";
    }

    public Map<String, Object> login(String username, String password) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                String token = jwtService.generateToken(user);
                return Map.of(
                        "message", "Login successful",
                        "userId", user.getId(),
                        "username", user.getUsername(),
                        "loyaltyPoints", user.getLoyaltyPoints(),
                        "token", token);
            }
        }
        return null;
    }
}