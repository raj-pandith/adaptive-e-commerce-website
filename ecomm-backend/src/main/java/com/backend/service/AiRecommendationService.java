package com.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.dto.PriceResponse;
import com.backend.dto.RecommendationResponse;
import com.backend.dto.SearchResponse;
import com.backend.dto.SimilarProductsResponse;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    // public PriceResponse getPersonalizedPrice(Long userId, Long productId) {
    // String url = PYTHON_BASE_URL
    // + "/price?user_id=" + userId
    // + "&product_id=" + productId;

    // try {
    // ResponseEntity<PriceResponse> response = restTemplate.getForEntity(url,
    // PriceResponse.class);

    // if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null)
    // {
    // return response.getBody();
    // }
    // } catch (Exception e) {
    // System.err.println("Error calling price: " + e.getMessage());
    // }

    // // Fallback
    // PriceResponse fallback = new PriceResponse();
    // fallback.setSuggestedPrice(2499.0);
    // fallback.setDiscountPercent(0.0);
    // fallback.setReason("Fallback - AI service unavailable");
    // return fallback;
    // }

    public PriceResponse getPersonalizedPrice(Long userId, Long productId) {
        String url = PYTHON_BASE_URL
                + "/price?user_id=" + userId
                + "&product_id=" + productId;

        System.out.println("DEBUG: Calling Python price API: " + url); // ← add this

        try {
            ResponseEntity<PriceResponse> response = restTemplate.getForEntity(url, PriceResponse.class);

            System.out.println("DEBUG: Response status: " + response.getStatusCode()); // ← add
            System.out.println(response);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                System.out.println("DEBUG: Got real price: " + response.getBody().getSuggestedPrice());
                return response.getBody();
            } else {
                System.out.println("DEBUG: Non-200 status from Python");
            }
        } catch (Exception e) {
            System.err.println("ERROR calling Python price API: " + e.getMessage());
            e.printStackTrace(); // ← print full stack trace
        }

        // Fallback
        System.out.println("DEBUG: Using fallback price 0.0");
        PriceResponse fallback = new PriceResponse();
        fallback.setSuggestedPrice(0.0);
        fallback.setDiscountPercent(0.0);
        fallback.setReason("Fallback - AI service unavailable");
        return fallback;
    }

    public List<Long> getSimilarProductIds(Long productId, int limit) {
        String url = PYTHON_BASE_URL + "/recommend-similar?product_id=" + productId + "&n=" + limit;

        try {
            ResponseEntity<SimilarProductsResponse> response = restTemplate.getForEntity(url,
                    SimilarProductsResponse.class);
            System.out.println(response);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Long> ids = response.getBody().getRecommendedProductIds();
                if (ids != null) {
                    return ids;
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling /recommend-similar: " + e.getMessage());
        }

        // Fallback: empty list or popular products
        return List.of();
    }

    public List<SearchResponse.SearchResultItem> searchProducts(String query, int limit) {
        String url = PYTHON_BASE_URL + "/search?query=" + URLEncoder.encode(query, StandardCharsets.UTF_8) + "&n="
                + limit;

        try {
            ResponseEntity<SearchResponse> response = restTemplate.getForEntity(url, SearchResponse.class);
            System.out.println(response);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getResults();
            }
        } catch (Exception e) {
            System.err.println("Error calling /search: " + e.getMessage());
            e.printStackTrace();
        }
        return List.of();
    }

}
