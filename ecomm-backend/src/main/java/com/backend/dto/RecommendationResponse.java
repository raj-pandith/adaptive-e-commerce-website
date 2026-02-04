package com.backend.dto;

import java.util.List;

public class RecommendationResponse {
    private Long userId;
    private List<Long> recommendedProductIds;
    private String message;
    private Long basedOnProductId;

    public Long getBasedOnProductId() {
        return basedOnProductId;
    }

    public void setBasedOnProductId(Long basedOnProductId) {
        this.basedOnProductId = basedOnProductId;
    }

    // Getters + Setters (or use Lombok @Data / @Getter @Setter)
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<Long> getRecommendedProductIds() {
        return recommendedProductIds;
    }

    public void setRecommendedProductIds(List<Long> recommendedProductIds) {
        this.recommendedProductIds = recommendedProductIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}