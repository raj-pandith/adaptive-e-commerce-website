package com.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}