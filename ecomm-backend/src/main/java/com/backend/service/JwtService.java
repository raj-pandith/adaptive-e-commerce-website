package com.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final Key key;

    // Inject secret from config
    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Generate JWT token (24 hours)
    public String generateToken(Long userId, String username) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 24 * 60 * 60 * 1000))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // Extract all claims
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .parseClaimsJws(token)
                .getBody();
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
}
