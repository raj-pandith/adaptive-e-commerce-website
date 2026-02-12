package com.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backend.model.User;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey key;

    // Inject secret from application.properties
    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Generate JWT token (24 hours)
    public String generateToken(Long userId, String username) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .issuedAt(new Date(now))
                .expiration(new Date(now + 24 * 60 * 60 * 1000))
                .signWith(key) // ✅ algorithm inferred automatically
                .compact();
    }

    // Extract all claims (🔥 FIX HERE)
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key) // ✅ NEW
                .build()
                .parseSignedClaims(token) // ✅ NEW
                .getPayload();
    }

    // Extract username
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Extract userId
    public Long extractUserId(String token) {
        return extractAllClaims(token).get("userId", Long.class);
    }

    // Validate token
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("loyaltyPoints", user.getLoyaltyPoints());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
                .signWith(key)
                .compact();
    }
}
