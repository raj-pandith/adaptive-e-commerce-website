package com.backend.dto;

import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;

@Data
@ToString
public class SearchResultDTO {
    private Long id;
    private String name;
    private BigDecimal originalPrice;
    private BigDecimal suggestedPrice;
    private double discountPercent;
    private String reason;
}