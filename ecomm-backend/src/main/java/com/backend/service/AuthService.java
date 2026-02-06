package com.backend.service;

import com.backend.model.User;
import com.backend.repo.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String signup(String username, String password, String email) {
        if (userRepository.findByUsername(username).isPresent()) {
            return "Username already exists";
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User();
        user.setUsername(username);
        user.setPassword(hashedPassword);
        user.setEmail(email);
        user.setLoyaltyPoints(100); // signup bonus

        userRepository.save(user);
        return "Signup successful! Welcome bonus: 100 loyalty points";
    }

    public User login(String username, String password) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty()) {
            return null;
        }

        User user = optionalUser.get();
        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }
}