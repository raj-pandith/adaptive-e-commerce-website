package com.backend.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> body) {
        if (stripeSecretKey == null || stripeSecretKey.trim().isEmpty()) {
            return ResponseEntity.status(500).body("Stripe secret key is not configured in application.yml");
        }

        if (!body.containsKey("amount") || body.get("amount") == null) {
            return ResponseEntity.badRequest().body("Amount is required");
        }

        try {
            Stripe.apiKey = stripeSecretKey;

            Number amountRaw = (Number) body.get("amount");
            int amountInPaise = amountRaw.intValue() * 100; // rupees → paise

            Map<String, Object> params = new HashMap<>();
            params.put("amount", amountInPaise);
            params.put("currency", "inr");
            params.put("payment_method_types", List.of("card")); // add "upi" later if needed

            PaymentIntent intent = PaymentIntent.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Stripe error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }
}
