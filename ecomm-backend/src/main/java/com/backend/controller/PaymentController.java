package com.backend.controller;

import com.backend.model.User;
import com.backend.service.LoyaltyService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final LoyaltyService loyaltyService;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody Map<String, Object> body) {
        // 1. Validate Stripe key configuration
        if (stripeSecretKey == null || stripeSecretKey.trim().isEmpty()) {
            logger.error("Stripe secret key is missing or empty in application.yml");
            return ResponseEntity.status(500).body(Map.of(
                    "error", "server_error",
                    "message", "Stripe configuration error - contact support"));
        }

        // 2. Validate amount (required)
        if (!body.containsKey("amount") || body.get("amount") == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "invalid_request",
                    "message", "Amount is required"));
        }

        try {
            // Set Stripe API key
            Stripe.apiKey = stripeSecretKey;

            // Convert amount to paise (Stripe uses smallest currency unit)
            Number amountRaw = (Number) body.get("amount");
            long amountInPaise = amountRaw.longValue() * 100;

            // Optional: userId (fallback to 1 for testing/demo)
            Long userId = body.containsKey("userId")
                    ? Long.valueOf(body.get("userId").toString())
                    : 1L;

            // Optional: orderId (generate if not provided)
            String orderId = body.getOrDefault("orderId", "order_" + System.currentTimeMillis()).toString();

            // Build PaymentIntent parameters
            Map<String, Object> params = new HashMap<>();
            params.put("amount", amountInPaise);
            params.put("currency", "inr");
            params.put("payment_method_types", List.of("card")); // Only card for now (UPI disabled)

            // Metadata for internal tracking
            Map<String, String> metadata = new HashMap<>();
            metadata.put("userId", userId.toString());
            metadata.put("orderId", orderId);
            params.put("metadata", metadata);

            // Optional description
            params.put("description", "AI Shop Order #" + orderId);

            // Optional receipt email (if provided)
            if (body.containsKey("email")) {
                params.put("receipt_email", body.get("email").toString());
            }

            // Create PaymentIntent
            PaymentIntent intent = PaymentIntent.create(params);

            // Prepare response for frontend
            Map<String, Object> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());
            response.put("amount", intent.getAmount() / 100.0); // back to rupees for frontend
            response.put("currency", intent.getCurrency());
            response.put("paymentIntentId", intent.getId());
            response.put("status", intent.getStatus());

            logger.info("PaymentIntent created: ID={}, Amount={} INR", intent.getId(), amountInPaise / 100.0);

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            logger.error("Stripe API error during PaymentIntent creation", e);
            return ResponseEntity.status(400).body(Map.of(
                    "error", "stripe_error",
                    "code", e.getCode(),
                    "message", e.getStripeError().getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error in createPaymentIntent", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "server_error",
                    "message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completePayment(@RequestBody Map<String, Object> body) {
        try {
            // Required: userId and amount
            if (!body.containsKey("userId") || !body.containsKey("amount")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "userId and amount are required"));
            }

            Long userId = Long.valueOf(body.get("userId").toString());
            double orderAmount = Double.parseDouble(body.get("amount").toString());

            // Calculate points (example: 10 points per ₹100 spent)
            int pointsEarned = (int) Math.floor(orderAmount / 100) * 10;

            // Award points using LoyaltyService (inject it)
            User updatedUser = loyaltyService.addPoints(userId, pointsEarned);

            if (updatedUser == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Optional: log or add more data
            logger.info("Points awarded to user {}: {} (new total: {})",
                    userId, pointsEarned, updatedUser.getLoyaltyPoints());

            return ResponseEntity.ok(Map.of(
                    "message", "Payment completed and points awarded",
                    "pointsEarned", pointsEarned,
                    "newTotalPoints", updatedUser.getLoyaltyPoints(),
                    "orderAmount", orderAmount));

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid userId or amount format"));
        } catch (Exception e) {
            logger.error("Error in /payment/complete", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Internal server error",
                    "message", e.getMessage()));
        }
    }

}