package com.backend.dto;

import lombok.Data;
import lombok.ToString;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@ToString
public class SearchResponse {
    private String query;
    private List<SearchResultItem> results;
    private int totalResults;
    private String message;

    @Data
    public static class SearchResultItem {
        @JsonProperty("product_id")
        private Long productId;
        @JsonProperty("similarity_score")
        private double similarityScore;
    }
}