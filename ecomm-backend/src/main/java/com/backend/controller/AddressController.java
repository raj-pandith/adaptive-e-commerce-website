package com.backend.controller;

import com.backend.model.Address;
import com.backend.repo.AddressRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    private final AddressRepository addressRepository;

    @Autowired
    public AddressController(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    // Save new address
    @PostMapping
    public ResponseEntity<Address> saveAddress(@RequestBody Address address) {
        if (address.getUserId() == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    // Optional: Get all addresses for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getUserAddresses(@PathVariable Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        return ResponseEntity.ok(addresses);
    }
}