package com.backend.controller;

import com.backend.model.User;
import com.backend.service.AuthService;
import com.backend.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String email = request.get("email");

        if (username == null || password == null || username.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        String message = authService.signup(username, password, email);
        if (message.contains("already exists")) {
            return ResponseEntity.badRequest().body(message);
        }

        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        User user = authService.login(username, password);

        if (user != null) {
            String token = jwtService.generateToken(user.getId(), user.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "loyaltyPoints", user.getLoyaltyPoints(),
                    "token", token // ← REAL JWT TOKEN
            ));
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }
}