package com.backend.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.dto.PriceResponse;
import com.backend.dto.RecommendationResponse;

import java.util.List;

@Service
public class AiRecommendationService {

    private final RestTemplate restTemplate;

    // You can hardcode for demo, or put in application.properties
    private final String PYTHON_BASE_URL = "http://localhost:8000";

    public AiRecommendationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Long> getRecommendedProductIds(Long userId, int limit) {
        String url = PYTHON_BASE_URL + "/recommend?user_id=" + userId + "&n=" + limit;

        try {
            ResponseEntity<RecommendationResponse> response = restTemplate.getForEntity(url,
                    RecommendationResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getRecommendedProductIds();
            }
        } catch (Exception e) {
            // In production → log error, fallback to popular products
            System.err.println("Error calling recommendation: " + e.getMessage());
        }

        // Fallback: return empty or some default products
        return List.of();
    }

    public PriceResponse getPersonalizedPrice(Long userId, Long productId) {
        String url = PYTHON_BASE_URL
                + "/price?user_id=" + userId
                + "&product_id=" + productId;

        try {
            ResponseEntity<PriceResponse> response = restTemplate.getForEntity(url, PriceResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("Error calling price: " + e.getMessage());
        }

        // Fallback
        PriceResponse fallback = new PriceResponse();
        fallback.setSuggestedPrice(2499.0);
        fallback.setDiscountPercent(0.0);
        fallback.setReason("Fallback - AI service unavailable");
        return fallback;
    }

    public List<Long> getSimilarProductIds(Long productId, int limit) {
        String url = PYTHON_BASE_URL + "/recommend-similar?product_id=" + productId + "&n=" + limit;

        try {
            ResponseEntity<RecommendationResponse> response = restTemplate.getForEntity(url,
                    RecommendationResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getRecommendedProductIds();
            }
        } catch (Exception e) {
            System.err.println("Error calling similar: " + e.getMessage());
        }
        return List.of();
    }

}
