package com.backend.service;

import org.springframework.stereotype.Service;

import com.backend.model.User;
import com.backend.repo.UserRepository;

@Service
public class LoyaltyService {

    private final UserRepository userRepository;

    public LoyaltyService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User addPoints(Long userId, int points) {
        return userRepository.findById(userId).map(user -> {
            user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
            return userRepository.save(user);
        }).orElse(null);
    }
}