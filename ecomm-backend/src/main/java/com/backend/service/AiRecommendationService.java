package com.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
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

    private static final Logger logger = LoggerFactory.getLogger(AiRecommendationService.class);

    private final RestTemplate restTemplate;

    // Python FastAPI URL (change if different)
    private final String PYTHON_BASE_URL = "http://localhost:8000";

    @Autowired
    public AiRecommendationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get personalized price for a product based on user loyalty points
     */
    public PriceResponse getPersonalizedPrice(Long userId, Long productId) {
        String url = PYTHON_BASE_URL + "/price?user_id=" + userId + "&product_id=" + productId;

        logger.info("Calling Python price API: {}", url);

        try {
            ResponseEntity<PriceResponse> response = restTemplate.getForEntity(url, PriceResponse.class);

            logger.debug("Python API response status: {}", response.getStatusCode());
            logger.debug("Python API response body: {}", response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                PriceResponse price = response.getBody();
                logger.info("Success: suggestedPrice={}, discount={}, reason={}",
                        price.getSuggestedPrice(), price.getDiscountPercent(), price.getReason());
                return price;
            } else {
                logger.warn("Non-200 status from Python: {}", response.getStatusCode());
            }
        } catch (HttpClientErrorException e) {
            // 4xx errors from Python (e.g. 400, 404)
            logger.error("Client error from Python API ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (HttpServerErrorException e) {
            // 5xx errors from Python
            logger.error("Server error from Python API ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.error("Unexpected error calling Python price API: {}", url, e);
        }

        // Fallback: return reasonable default (e.g. 5% discount)
        logger.info("Using fallback price for user {} product {}", userId, productId);
        PriceResponse fallback = new PriceResponse();
        fallback.setSuggestedPrice(0.95 * 2499.0); // example: 5% off a base price
        fallback.setDiscountPercent(5.0);
        fallback.setReason("Fallback - AI service unavailable");
        return fallback;
    }

    /**
     * Get recommended product IDs for a user
     */
    public List<Long> getRecommendedProductIds(Long userId, int limit) {
        String url = PYTHON_BASE_URL + "/recommend?user_id=" + userId + "&n=" + limit;
        logger.info("Calling recommendation API: {}", url);

        try {
            ResponseEntity<RecommendationResponse> response = restTemplate.getForEntity(url,
                    RecommendationResponse.class);
            logger.debug("Recommendation response: status={}, body={}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getRecommendedProductIds();
            }
        } catch (Exception e) {
            logger.error("Error calling /recommend: {}", e.getMessage(), e);
        }

        logger.warn("Fallback: no recommendations for user {}", userId);
        return List.of();
    }

    /**
     * Get similar product IDs for a given product
     */
    public List<Long> getSimilarProductIds(Long productId, int limit) {
        String url = PYTHON_BASE_URL + "/recommend-similar?product_id=" + productId + "&n=" + limit;
        logger.info("Calling similar products API: {}", url);

        try {
            ResponseEntity<SimilarProductsResponse> response = restTemplate.getForEntity(url,
                    SimilarProductsResponse.class);
            logger.debug("Similar response: status={}, body={}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Long> ids = response.getBody().getRecommendedProductIds();
                if (ids != null)
                    return ids;
            }
        } catch (Exception e) {
            logger.error("Error calling /recommend-similar: {}", e.getMessage(), e);
        }

        logger.warn("Fallback: no similar products for {}", productId);
        return List.of();
    }

    /**
     * Semantic search for products
     */
    public List<SearchResponse.SearchResultItem> searchProducts(String query, int limit) {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = PYTHON_BASE_URL + "/search?query=" + encodedQuery + "&n=" + limit;
        logger.info("Calling search API: {}", url);

        try {
            ResponseEntity<SearchResponse> response = restTemplate.getForEntity(url, SearchResponse.class);
            logger.debug("Search response: status={}, body={}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getResults();
            }
        } catch (Exception e) {
            logger.error("Error calling /search: {}", e.getMessage(), e);
        }

        logger.warn("Fallback: no search results for query '{}'", query);
        return List.of();
    }
}