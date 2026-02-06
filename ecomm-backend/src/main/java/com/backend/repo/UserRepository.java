package com.backend.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}