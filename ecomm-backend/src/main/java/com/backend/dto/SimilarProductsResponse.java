package com.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class SimilarProductsResponse {
    @JsonProperty("based_on_product")
    private Long basedOnProductId;
    @JsonProperty("recommended_product_ids")
    private List<Long> recommendedProductIds;
    @JsonProperty("reason")
    private String message;

    // Getters & setters (or use Lombok @Data)
    public Long getBasedOnProductId() {
        return basedOnProductId;
    }

    public void setBasedOnProductId(Long basedOnProductId) {
        this.basedOnProductId = basedOnProductId;
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